import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name:"chat",
    initialState:{
        onlineUsers:[],
        messages:[],
        unreadMessages: {}, // Object to store unread message counts per user
    },
    reducers:{
        // actions
        setOnlineUsers:(state,action) => {
            state.onlineUsers = action.payload;
        },
        setMessages:(state,action) => {
            state.messages = action.payload;
        },
        addNewMessage:(state,action) => {
            const { newMessage, currentUserId } = action.payload;
            state.messages.push(newMessage);
            console.log('[Redux] addNewMessage:', { newMessage, currentUserId });
            console.log('[Redux] currentUserId:', currentUserId, '| newMessage.senderId:', newMessage.senderId);
            // If this is a message received from someone else, increment unread count
            if (newMessage.senderId !== currentUserId) {
                const senderId = newMessage.senderId;
                if (!state.unreadMessages) {
                    state.unreadMessages = {};
                }
                state.unreadMessages[senderId] = (state.unreadMessages[senderId] || 0) + 1;
                console.log(`[Redux] Incremented unread for senderId ${senderId}:`, state.unreadMessages[senderId]);
            } else {
                console.log('[Redux] Message sent by current user, not incrementing unread.');
            }
        },
        markMessagesAsRead:(state,action) => {
            const userId = action.payload;
            if (state.unreadMessages && state.unreadMessages[userId]) {
                delete state.unreadMessages[userId];
            }
        },
        clearAllUnreadMessages:(state) => {
            state.unreadMessages = {};
        }
    }
});
export const {
    setOnlineUsers, 
    setMessages, 
    addNewMessage, 
    markMessagesAsRead, 
    clearAllUnreadMessages
} = chatSlice.actions;
export default chatSlice.reducer;