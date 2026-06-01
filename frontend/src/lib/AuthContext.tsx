"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from './api';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';

type User = {
    _id: string;
    firstName: string;
    lastName: string;
    contactNumber: string;
    email: string;
    address?: string; // Added address
    accountType: 'user' | 'researcher' | 'admin';
    profilePhoto?: string;
    stats?: {
        totalScans: number;
        healthyPlants: number;
        diseasedPlants: number;
    };
    plantReminders?: {
        water: {
            enabled: boolean;
            frequency: number;
            lastTransmission: string | Date;
            reminderTime: string;
        };
        fertilizer: {
            enabled: boolean;
            frequency: string;
            nextProtocol: string | Date;
            reminderTime: string;
        };
    };
    dailyRoutine?: string;
    scannerSettings?: {
        cameraOption: boolean;
        autoPlantDetection: boolean;
        saveInGoogleDrive: boolean;
    };
    privacyGrid?: {
        notifications: boolean;
        dataEncryption: boolean;
    };
    addresses?: Array<{
        type: string;
        street: string;
        city: string;
        state: string;
        zip: string;
        isDefault: boolean;
    }>;
    ringtoneSettings?: {
        notificationSoundEnabled: boolean;
        alarmSoundEnabled: boolean;
        selectedNotificationRingtone: string;
        selectedAlarmRingtone: string;
        customRingtones?: string[];
    };
};

type AuthContextType = {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: Record<string, unknown>) => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (otp: string, password: string) => Promise<void>;
    logout: () => void;
    updateProfile: (data: Partial<User>, skipNetwork?: boolean) => Promise<void>;
    isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();



    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('pc_token');
        localStorage.removeItem('pc_user');
        router.push('/login');
    }, [router]);

    useEffect(() => {
        const initAuth = async () => {
            const savedToken = localStorage.getItem('pc_token');
            const savedUser = localStorage.getItem('pc_user');

            if (savedToken && savedUser) {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));

                // Verify token with backend
                try {
                    const res = await api.get('/auth/me');
                    if (res.data.status === 'success') {
                        setUser(res.data.data.user);
                    }
                } catch (err) {
                    console.error("Token verification failed", err);
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, [logout]);

    // Route Protection
    useEffect(() => {
        const publicRoutes = ['/login', '/register', '/forgot-password'];
        if (!loading && !user && !publicRoutes.includes(pathname)) {
            router.push('/login');
        } else if (!loading && user && (pathname === '/login' || pathname === '/register')) {
            router.push('/dashboard');
        }
    }, [user, loading, pathname, router]);

    const login = async (identifier: string, password: string) => {
        try {
            const res = await api.post('/auth/login', { email: identifier, password });
            if (res.data.status === 'success') {
                const { token, data } = res.data;
                setToken(token);
                setUser(data.user);
                localStorage.setItem('pc_token', token);
                localStorage.setItem('pc_user', JSON.stringify(data.user));
                router.push('/dashboard');
            } else {
                throw new Error(res.data.message || 'Login failed');
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                if (err.code === 'ECONNABORTED') {
                    throw new Error('Connection timed out. The server might be offline.');
                }
                throw new Error(err.response?.data?.message || 'Login failed');
            }
            throw new Error((err as Error).message || 'Login failed');
        }
    };

    const register = async (userData: Record<string, unknown>) => {
        try {
            const res = await api.post('/auth/register', userData);
            if (res.data.status === 'success') {
                const { token, data } = res.data;
                setToken(token);
                setUser(data.user);
                localStorage.setItem('pc_token', token);
                localStorage.setItem('pc_user', JSON.stringify(data.user));
                router.push('/dashboard');
            } else {
                throw new Error(res.data.message || 'Registration failed');
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                if (err.code === 'ECONNABORTED') {
                    throw new Error('Connection timed out. Server might be down or warming up.');
                }
                throw new Error(err.response?.data?.message || 'Registration failed. Please check if your email or phone is already registered.');
            }
            throw new Error((err as Error).message || 'Registration failed');
        }
    };

    const forgotPassword = async (contact: string) => {
        try {
            const res = await api.post('/auth/forgotPassword', { contact });
            return res.data;
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                // Return the specific error message from the backend if available
                const backendMessage = err.response?.data?.message;
                throw new Error(backendMessage || 'Failed to send OTP. Please check your connection.');
            }
            throw new Error((err as Error).message || 'An unexpected error occurred while sending OTP.');
        }
    };

    const resetPassword = async (otp: string, password: string) => {
        try {
            const res = await api.post('/auth/resetPassword', { otp, password });
            if (res.data.status === 'success') {
                const { token, data } = res.data;
                setToken(token);
                setUser(data.user);
                localStorage.setItem('pc_token', token);
                localStorage.setItem('pc_user', JSON.stringify(data.user));
                router.push('/dashboard');
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                throw new Error(err.response?.data?.message || 'Password reset failed');
            }
            throw new Error('Password reset failed');
        }
    };

    const updateProfile = async (data: Partial<User>, skipNetwork = false) => {
        try {
            if (skipNetwork) {
                if (user) {
                    const updatedUser = { ...user, ...data } as User;
                    setUser(updatedUser);
                    localStorage.setItem('pc_user', JSON.stringify(updatedUser));
                }
                return;
            }

            const res = await api.patch('/users/updateMe', data);

            if (res.data.status === 'success') {
                const updatedUser = res.data.data.user;
                setUser(updatedUser);
                localStorage.setItem('pc_user', JSON.stringify(updatedUser));
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                throw new Error(err.response?.data?.message || 'Profile update failed');
            }
            throw new Error('Profile update failed');
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            register,
            forgotPassword,
            resetPassword,
            logout,
            updateProfile,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
