/**
 * API Configuration
 * Centralized API configuration and base setup
 */

const API_CONFIG = {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
};

/**
 * HTTP Client with error handling
 */
class APIClient {
    constructor(config) {
        this.baseURL = config.baseURL;
        this.timeout = config.timeout;
        this.headers = config.headers;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        // Get token based on context (Path or Endpoint)
        let token = null;
        try {
            const isAdminPath = window.location.pathname.startsWith('/admin');
            const isAdminService = endpoint.startsWith('/admin') || endpoint.startsWith('/upload');

            // Priority 1: Admin token for Admin panel or Admin-only services
            if (isAdminPath || isAdminService) {
                token = localStorage.getItem('adminToken');
            }

            // Priority 2: Customer token for general store use
            if (!token) {
                const authStorage = localStorage.getItem('auth-storage');
                if (authStorage) {
                    const parsed = JSON.parse(authStorage);
                    token = parsed.state?.token;
                }
            }
        } catch (e) {
            console.error('Error reading auth token', e);
        }

        // Determine headers
        const headers = {
            ...this.headers,
            ...options.headers,
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        };

        // If body is FormData, let fetch set the Content-Type with boundary
        if (options.body instanceof FormData) {
            delete headers['Content-Type'];
        }

        const config = {
            ...options,
            headers
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...config,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // Handle 401 Unauthorized globally for admin routes
            if (response.status === 401 && endpoint.startsWith('/admin')) {
                localStorage.removeItem('adminToken');
                window.location.href = '/admin-login';
                return;
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({
                    message: response.statusText,
                }));
                throw new Error(error.message || `HTTP Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') throw new Error('Request timeout');
            throw error;
        }
    }

    get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    post(endpoint, data) {
        const isFormData = data instanceof FormData;
        return this.request(endpoint, {
            method: 'POST',
            body: isFormData ? data : JSON.stringify(data),
        });
    }

    put(endpoint, data) {
        const isFormData = data instanceof FormData;
        return this.request(endpoint, {
            method: 'PUT',
            body: isFormData ? data : JSON.stringify(data),
        });
    }

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

export const apiClient = new APIClient(API_CONFIG);
export default apiClient;
