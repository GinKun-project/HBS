import axios from 'axios';
import { rateLimiter } from '../utils/rateLimiter';


const http = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});


http.interceptors.request.use(
    (config) => {

        const csrfToken = getCookie('XSRF-TOKEN');
        if (csrfToken && config.method !== 'get') {
            config.headers['X-CSRF-Token'] = csrfToken;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


http.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 429) {
            const retryAfter = error.response.headers['retry-after'];
            const retryCount = originalRequest._retryCount || 0;
            const maxRetries = 3;
            const isAuthEndpoint = originalRequest.url?.includes('/auth/');

            if (isAuthEndpoint) {
                // Allow a single quick retry for auth endpoints instead of skipping entirely.
                // If the server provided a Retry-After header, use it but cap to 5s to avoid long waits.
                const authRetryCount = originalRequest._retryCount || 0;
                if (authRetryCount < 1) {
                    originalRequest._retryCount = authRetryCount + 1;

                    let delay;
                    if (retryAfter) {
                        const retryAfterMs = parseInt(retryAfter, 10) * 1000;
                        delay = Math.min(retryAfterMs, 5000);
                    } else {
                        delay = 1000; // quick 1s retry when no header
                    }

                    console.warn(`Auth endpoint rate-limited. Retrying once in ${delay / 1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return http(originalRequest);
                }

                console.error('Rate limit hit on auth endpoint. Max auth retries reached.');
                return Promise.reject(new Error('Authentication service is temporarily unavailable. Please try again in a few minutes.'));
            }

            if (retryCount < maxRetries) {
                originalRequest._retryCount = retryCount + 1;

                let delay;
                if (retryAfter) {
                    const retryAfterMs = parseInt(retryAfter, 10) * 1000;
                    delay = Math.min(retryAfterMs, 30000);
                } else {
                    delay = Math.min(1000 * Math.pow(2, retryCount), 30000) + Math.random() * 1000;
                }

                console.warn(`Rate limit hit. Retrying in ${delay / 1000} seconds... (Attempt ${retryCount + 1}/${maxRetries})`);

                await new Promise(resolve => setTimeout(resolve, delay));
                return http(originalRequest);
            } else {
                console.error('Max retries reached for rate-limited request');
                return Promise.reject(new Error('Too many requests. Please try again later.'));
            }
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                await http.post('/auth/refresh');
                return http(originalRequest);
            } catch (refreshError) {
                // Only redirect if we're not on a login/signup page already
                if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);


function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

export default http;
