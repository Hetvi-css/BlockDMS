import { createSlice } from '@reduxjs/toolkit';

const storedUser = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
const storedToken = localStorage.getItem('token');

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: storedUser,
        token: storedToken,
        isAuthenticated: !!(storedUser && storedToken),
        loading: false,
        error: null
    },
    reducers: {
        setCredentials: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.error = null;
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('user', JSON.stringify(action.payload.user));
        },
        updateUser: (state, action) => {
            state.user = action.payload;
            localStorage.setItem('user', JSON.stringify(action.payload));
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
        setLoading: (state, action) => { state.loading = action.payload; },
        setError: (state, action) => { state.error = action.payload; }
    }
});

export const { setCredentials, updateUser, logout, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
