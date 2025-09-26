import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: import.meta.env.VITE_BASEURL || 'https://vibe-tribe-phi.vercel.app',
    // Remove withCredentials for Vercel deployment
    // withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 15000 // Increased timeout for serverless functions
});

// Request queue for handling multiple concurrent requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Add token to every request
api.interceptors.request.use(async (config) => {
    // Don't override Content-Type for FormData
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
        toast.error('Authentication error. Please try logging in again.');
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle timeout errors
        if (error.code === 'ECONNABORTED') {
            toast.error('Request timed out. Please try again.');
            return Promise.reject(error);
        }

        // Handle network errors
        if (!error.response) {
            toast.error('Network error. Please check your connection.');
            return Promise.reject(error);
        }

        // Handle authentication errors
        if (error.response.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                try {
                    const token = await new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    });
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                } catch (err) {
                    return Promise.reject(err);
                }
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const token = await window.Clerk?.session?.getToken();
                if (token) {
                    processQueue(null, token);
                    return api(originalRequest);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                toast.error('Session expired. Please login again.');
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        const message = error.response?.data?.message || error.message || 'An error occurred';
        toast.error(message);
        return Promise.reject(error);
    }
);

export default api;
