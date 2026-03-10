"use client";

import React, { createContext, useContext, useState } from 'react';
import { translations, Language } from './translations';

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [languageState, setLanguageState] = useState<Language>(() => {
        if (typeof window !== 'undefined') {
            const savedLang = localStorage.getItem('app-language') as Language;
            if (savedLang && translations[savedLang]) {
                return savedLang;
            }
        }
        return 'en';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('app-language', lang);
    };

    const t = (path: string): string => {
        const keys = path.split('.');
        let currentTranslations: Record<string, unknown> = (translations[languageState] || translations['en']) as Record<string, unknown>;
        let englishTranslations: Record<string, unknown> = translations['en'] as Record<string, unknown>;

        for (const key of keys) {
            if (currentTranslations && typeof currentTranslations === 'object' && key in currentTranslations) {
                currentTranslations = currentTranslations[key] as Record<string, unknown>;
            } else {
                currentTranslations = {} as Record<string, unknown>;
            }

            if (englishTranslations && typeof englishTranslations === 'object' && key in englishTranslations) {
                englishTranslations = englishTranslations[key] as Record<string, unknown>;
            } else {
                englishTranslations = {} as Record<string, unknown>;
            }
        }

        if (typeof currentTranslations === 'string') return currentTranslations;
        if (typeof englishTranslations === 'string') return englishTranslations;
        return path;
    };

    return (
        <LanguageContext.Provider value={{ language: languageState, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
