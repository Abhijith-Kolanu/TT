// src/redux/notificationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    notifications: [],
    unreadCount: 0,
};

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        setNotifications: (state, action) => {
            state.notifications = action.payload;
            // Calculate unread count
            state.unreadCount = action.payload.filter(notif => !notif.read).length;
        },
        addNotification: (state, action) => {
            console.log("Adding notification to state:", action.payload);
            state.notifications.unshift(action.payload);
            // Increment unread count if notification is unread
            if (!action.payload.read) {
                state.unreadCount += 1;
            }
        },
        markNotificationAsRead: (state, action) => {
            const notificationId = action.payload;
            const notification = state.notifications.find(notif => notif._id === notificationId);
            if (notification && !notification.read) {
                notification.read = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        markAllNotificationsAsRead: (state) => {
            state.notifications.forEach(notif => {
                notif.read = true;
            });
            state.unreadCount = 0;
        },
        clearNotifications: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
        },
    },
});

export const { 
    setNotifications, 
    addNotification, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    clearNotifications 
} = notificationSlice.actions;

export default notificationSlice.reducer;
