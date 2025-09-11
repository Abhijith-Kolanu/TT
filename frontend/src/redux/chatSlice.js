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
            // Only increment unread if this client is the receiver and the chat is not open
            if (newMessage.isReceiver && newMessage.senderId !== currentUserId) {
                const senderId = newMessage.senderId;
                if (!state.unreadMessages) {
                    state.unreadMessages = {};
                }
                state.unreadMessages[senderId] = (state.unreadMessages[senderId] || 0) + 1;
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