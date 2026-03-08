import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService, LoginRequest } from '@/services/authService';
import type { RootState } from '@/store';

// ── Types ───────────────────────────────────────────────────────────
interface AuthUser {
    id?: any;
    name: string;
    email?: string;
    role: string;
    profilePicture?: string;
}

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

// ── Async Thunks ────────────────────────────────────────────────────

export const loginUser = createAsyncThunk<
    { user: AuthUser; token: string; refreshToken: string },
    LoginRequest,
    { rejectValue: string }
>(
    'auth/loginUser',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await authService.login(credentials);
            if (response.isSuccess && response.data) {
                const { accessToken, refreshToken, userName, role, email, profilePicture, id } = response.data;
                return {
                    user: { id, name: userName, role, email, profilePicture },
                    token: accessToken,
                    refreshToken,
                };
            }
            return rejectWithValue(response.message || 'Login failed');
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Something went wrong');
        }
    }
);

export const logoutUser = createAsyncThunk<void, void, { state: RootState }>(
    'auth/logoutUser',
    async (_, { getState, dispatch }) => {
        const { refreshToken } = getState().auth;
        try {
            if (refreshToken) {
                await authService.logout(refreshToken);
            }
        } catch (_) {
            // Silently fail — still log out client-side
        }
        dispatch(logout());
    }
);

// ── Slice ───────────────────────────────────────────────────────────

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        tokenRefreshed: (state, action: PayloadAction<{ token: string; refreshToken: string }>) => {
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
        },
        updateCredentials: (state, action: PayloadAction<{ user: AuthUser; token: string; refreshToken: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // loginUser
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.refreshToken = action.payload.refreshToken;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Login failed';
            })
            // logoutUser
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
                state.loading = false;
                state.error = null;
            });
    },
});

export const { tokenRefreshed, logout, updateCredentials } = authSlice.actions;
export default authSlice.reducer;
