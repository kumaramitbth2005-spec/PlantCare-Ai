import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://plantcare-ai-1-vf3t.onrender.com/api';

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
            // Optional: Handle unauthorized access globally (e.g. clear tokens, but let components do redirect)
            console.error('Unauthorized access. Token may be expired.');
        }
    }
    return Promise.reject(error);
});

export default api;
