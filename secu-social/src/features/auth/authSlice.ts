import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Role, User } from '../../types';

interface AuthState {
  user: (User & { nom?: string; prenom?: string }) | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const savedUser = localStorage.getItem('auth_user');
const initialState: AuthState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  isAuthenticated: !!savedUser,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<User & { nom?: string; prenom?: string }>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      localStorage.setItem('auth_user', JSON.stringify(action.payload));
      localStorage.setItem('auth_token', 'mock-token-' + action.payload.id);
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { loginSuccess, loginFailure, logout, setLoading } = authSlice.actions;

export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.role;

export default authSlice.reducer;
