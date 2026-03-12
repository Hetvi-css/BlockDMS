import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
    name: 'ui',
    initialState: { pendingCount: 0, notification: null },
    reducers: {
        setPendingCount: (state, action) => { state.pendingCount = action.payload; },
        showNotification: (state, action) => { state.notification = action.payload; },
        clearNotification: (state) => { state.notification = null; }
    }
});

export const { setPendingCount, showNotification, clearNotification } = uiSlice.actions;
export default uiSlice.reducer;
