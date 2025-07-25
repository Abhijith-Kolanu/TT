// src/redux/notificationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    notifications: [],
};

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        addNotification: (state, action) => {
            console.log("Adding notification to state:", action.payload);
            state.notifications.unshift(action.payload);
        },
        clearNotifications: (state) => {
            state.notifications = [];
        },
    },
});

export const { addNotification, clearNotifications } = notificationSlice.actions;

export default notificationSlice.reducer;
