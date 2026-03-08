import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Store is injected by Providers to avoid circular dependency: store → categorySlice → categoryService → api → store
type StoreInstance = {
    getState: () => { auth: { token: string | null; refreshToken: string | null } };
    dispatch: (action: unknown) => unknown;
};
let _store: StoreInstance | null = null;

export function setStore(store: StoreInstance) {
    _store = store;
}

function getStore(): StoreInstance | null {
    return _store;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7267/api';
const SERVER_URL = API_URL.replace(/\/api$/, '');

export const getFileUrl = (path: string | null | undefined) => {
    if (!path) return '';
    if (path.startsWith('data:') || path.startsWith('http')) return path;
    return `${SERVER_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── Request Interceptor ─────────────────────────────────────────────
// Read JWT from Redux auth state (rehydrated by redux-persist). Attach Authorization: Bearer <token>.
api.interceptors.request.use(
    (config) => {
        const store = getStore();
        const token = store?.getState().auth.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response Interceptor (Token Refresh) ────────────────────────────
// On 401: read refresh_token from Redux (persisted), POST /api/auth/refresh,
// dispatch tokenRefreshed (redux-persist persists), retry original request.
// Uses dynamic import for auth actions to avoid circular dependency (api → authSlice → authService → api).

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (
            error.response?.status !== 401 ||
            originalRequest._retry ||
            originalRequest.url?.includes('/auth/refresh') ||
            originalRequest.url?.includes('/auth/login')
        ) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise<string>((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((newToken) => {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const store = getStore();
        const refreshToken = store?.getState().auth.refreshToken ?? null;

        if (!refreshToken || !store) {
            if (typeof window !== 'undefined' && store) {
                const { logout } = await import('@/store/slices/authSlice');
                store.dispatch(logout());
                window.location.href = '/login';
            }
            isRefreshing = false;
            return Promise.reject(error);
        }

        try {
            const { data: result } = await axios.post<{
                isSuccess: boolean;
                data?: { accessToken: string; refreshToken: string };
            }>(
                `${api.defaults.baseURL}/auth/refresh`,
                { refreshToken },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (result.isSuccess && result.data) {
                const newAccessToken = result.data.accessToken;
                const newRefreshToken = result.data.refreshToken;

                const { tokenRefreshed } = await import('@/store/slices/authSlice');
                store!.dispatch(
                    tokenRefreshed({
                        token: newAccessToken,
                        refreshToken: newRefreshToken,
                    })
                );

                processQueue(null, newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } else {
                processQueue(error, null);
                if (typeof window !== 'undefined' && store) {
                    const { logout } = await import('@/store/slices/authSlice');
                    store.dispatch(logout());
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        } catch (refreshError) {
            processQueue(refreshError, null);
            if (typeof window !== 'undefined' && store) {
                const { logout } = await import('@/store/slices/authSlice');
                store.dispatch(logout());
                window.location.href = '/login';
            }
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;
