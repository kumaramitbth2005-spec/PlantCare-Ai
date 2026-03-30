"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Notification = {
    id: string;
    title: string;
    description: string;
    time: string;
    read: boolean;
    type: 'update' | 'alert' | 'info';
};

type NotificationContextType = {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notif: Omit<Notification, 'id' | 'read' | 'time'>) => void;
    markAsRead: (id: string) => void;
    clearAll: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const loadNotifications = () => {
            const saved = localStorage.getItem('app-notifications');
            if (saved) {
                setNotifications(JSON.parse(saved));
            } else {
                // Add initial mock notification
                const initialNotif: Notification = {
                    id: '1',
                    title: 'System Update',
                    description: 'The plant analysis neural engine has been upgraded to v2.4.0.',
                    time: new Date().toISOString(),
                    read: false,
                    type: 'update'
                };
                setNotifications([initialNotif]);
            }
        };
        loadNotifications();
    }, []);

    useEffect(() => {
        localStorage.setItem('app-notifications', JSON.stringify(notifications));
    }, [notifications]);

    const addNotification = (notif: Omit<Notification, 'id' | 'read' | 'time'>) => {
        const newNotif: Notification = {
            ...notif,
            id: Math.random().toString(36).substr(2, 9),
            read: false,
            time: new Date().toISOString(),
        };
        setNotifications(prev => [newNotif, ...prev]);

        // Play sound if enabled and in browser
        if (typeof window !== 'undefined') {
            const savedUser = localStorage.getItem('pc_user');
            if (savedUser) {
                const user = JSON.parse(savedUser);
                if (user.ringtoneSettings?.notificationSoundEnabled !== false) {
                    const audioPath = user.ringtoneSettings?.selectedNotificationRingtone || '/audio/notification_1.mp3';
                    const audio = new Audio(audioPath);
                    audio.play().catch(e => console.log('Audio playback failed or blocked:', e));
                }
            }
        }
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, clearAll }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
