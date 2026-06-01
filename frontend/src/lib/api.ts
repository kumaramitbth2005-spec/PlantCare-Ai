import axios from 'axios';

const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const isLocal = hostname === 'localhost' || 
                         hostname === '127.0.0.1' || 
                         hostname.startsWith('192.168.') ||
                         hostname.startsWith('10.') ||
                         hostname.startsWith('172.');
        
        if (isLocal) {
            return 'http://127.0.0.1:8000/api';
        }
        return 'https://plantcare-ai-jcua.onrender.com/api';
    }
    return 'https://plantcare-ai-jcua.onrender.com/api';
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || getBaseUrl();
export const BASE_URL = API_URL.replace('/api', '');

const api = axios.create({
    baseURL: API_URL,
    timeout: 60000, // 60 second timeout to allow Render free tier to wake up from sleep
});

// Request interceptor to attach token
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('pc_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor to handle errors globally
api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
            console.error('API Request timed out after 60 seconds.');
        } else if (error.response?.status === 401) {
            console.warn('Unauthorized access. Token may be expired or invalid credentials.');
            if (typeof window !== 'undefined') {
                localStorage.removeItem('pc_token');
                // Avoid infinite redirect loops
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }
        }
    }
    return Promise.reject(error);
});

export default api;
