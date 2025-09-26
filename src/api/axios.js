import axios from 'axios';
import toast from 'react-hot-toast';

const baseURL = import.meta.env.VITE_BASEURL || 'https://vibe-tribe-project.vercel.app';

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 30000 // 30 seconds for serverless functions
});

// Add token to every request
api.interceptors.request.use(async (config) => {
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    
    try {
        if (window.Clerk?.session) {
            const token = await window.Clerk.session.getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
    } catch (error) {
        console.error('Error getting auth token:', error);
    }
    
    console.log(`🚀 API Request: ${config.method.toUpperCase()} ${baseURL}${config.url}`);
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
    (response) => {
        console.log(`✅ API Success: ${response.config.method.toUpperCase()} ${response.config.url}`);
        return response;
    },
    async (error) => {
        console.error('❌ API Error:', error);
        
        if (error.code === 'ECONNABORTED') {
            toast.error('Request timed out. Please try again.');
            return Promise.reject(error);
        }

        if (!error.response) {
            toast.error('Cannot connect to server. Check your internet connection.');
            return Promise.reject(error);
        }

        const message = error.response?.data?.message || error.message || 'An error occurred';
        toast.error(message);
        return Promise.reject(error);
    }
);

export default api;
