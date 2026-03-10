"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';

const API_URL = 'http://localhost:8000/api/auth';

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
    updateProfile: (data: Partial<User>) => Promise<void>;
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
                    const res = await axios.get(`${API_URL}/me`, {
                        headers: { Authorization: `Bearer ${savedToken}` }
                    });
                    if (res.data.status === 'success') {
                        setUser(res.data.data.user);
                        localStorage.setItem('pc_user', JSON.stringify(res.data.data.user));
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

    const login = async (email: string, password: string) => {
        try {
            const res = await axios.post(`${API_URL}/login`, { email, password });
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
                throw new Error(err.response?.data?.message || 'Login failed');
            }
            throw new Error('Login failed');
        }
    };

    const register = async (userData: Record<string, unknown>) => {
        try {
            const res = await axios.post(`${API_URL}/register`, userData);
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
                throw new Error(err.response?.data?.message || 'Registration failed');
            }
            throw new Error('Registration failed');
        }
    };

    const forgotPassword = async (contact: string) => {
        try {
            await axios.post(`${API_URL}/forgotPassword`, { contact });
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                throw new Error(err.response?.data?.message || 'Failed to send OTP');
            }
            throw new Error('Failed to send OTP');
        }
    };

    const resetPassword = async (otp: string, password: string) => {
        try {
            const res = await axios.post(`${API_URL}/resetPassword`, { otp, password });
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

    const updateProfile = async (data: Partial<User>) => {
        try {
            const res = await axios.patch('http://localhost:8000/api/users/updateMe', data, {
                headers: { Authorization: `Bearer ${token}` }
            });

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
