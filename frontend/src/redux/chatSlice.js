import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name:"chat",
    initialState:{
        onlineUsers:[],
        messages:[],
        unreadMessages: {}, // Object to store unread message counts per user
        selectedChatUserId: null, // Track which chat is currently open
    },
    reducers:{
        // actions
        setOnlineUsers:(state,action) => {
            state.onlineUsers = action.payload;
        },
        setMessages:(state,action) => {
            state.messages = action.payload;
        },
        setSelectedChatUserId:(state, action) => {
            state.selectedChatUserId = action.payload;
        },
        // Replace an optimistic message with the real one from the server
        replaceOptimisticMessage:(state, action) => {
            const { optimisticId, realMessage } = action.payload;
            const index = state.messages.findIndex(msg => msg._id === optimisticId);
            if (index !== -1) {
                state.messages[index] = realMessage;
            }
        },
        addNewMessage:(state,action) => {
            const { newMessage, currentUserId, selectedUserId } = action.payload;
            
            // Helper function to extract ID as string from various formats
            const extractId = (id) => {
                if (!id) return '';
                if (typeof id === 'string') return id;
                if (typeof id === 'object') {
                    // Handle MongoDB ObjectId serialization formats
                    if (id._id) return String(id._id);
                    if (id.$oid) return id.$oid;
                    if (id.toString && typeof id.toString === 'function') {
                        const str = id.toString();
                        // Check if it's a valid ObjectId string (24 hex chars)
                        if (/^[a-f\d]{24}$/i.test(str)) return str;
                    }
                }
                return String(id);
            };
            
            const senderId = extractId(newMessage.senderId);
            const receiverId = extractId(newMessage.receiverId);
            const currentUserIdStr = extractId(currentUserId);
            const selectedUserIdStr = selectedUserId ? extractId(selectedUserId) : (state.selectedChatUserId ? extractId(state.selectedChatUserId) : null);
            
            // Determine if this message belongs to the currently open conversation
            const isFromSelectedUser = senderId === selectedUserIdStr;
            const isToSelectedUser = receiverId === selectedUserIdStr;
            const isCurrentUserSender = senderId === currentUserIdStr;
            const isCurrentUserReceiver = receiverId === currentUserIdStr;
            
            // Only add message to the messages array if it belongs to the current conversation
            const belongsToCurrentConversation = 
                (isFromSelectedUser && isCurrentUserReceiver) || 
                (isToSelectedUser && isCurrentUserSender);
            
            if (belongsToCurrentConversation && selectedUserIdStr) {
                // Check for duplicate - don't add if message with same _id exists
                const existingIndex = state.messages.findIndex(msg => msg._id === newMessage._id);
                if (existingIndex === -1) {
                    // Also check if this is a server echo of an optimistic message we already have
                    const isDuplicateContent = state.messages.some(msg => 
                        msg.optimistic && 
                        msg.message === newMessage.message && 
                        extractId(msg.senderId) === senderId &&
                        extractId(msg.receiverId) === receiverId
                    );
                    
                    if (!isDuplicateContent) {
                        state.messages.push(newMessage);
                    }
                }
            }
            
            // Increment unread count only if:
            // 1. Current user is the receiver (check both by ID comparison and isReceiver flag)
            // 2. The sender is NOT the currently selected/open chat
            const isReceiver = isCurrentUserReceiver || newMessage.isReceiver === true;
            
            if (isReceiver && senderId && senderId !== selectedUserIdStr) {
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
        },
        resetChatState:(state) => {
            state.onlineUsers = [];
            state.messages = [];
            state.unreadMessages = {};
            state.selectedChatUserId = null;
        }
    }
});
export const {
    setOnlineUsers, 
    setMessages,
    setSelectedChatUserId,
    replaceOptimisticMessage,
    addNewMessage, 
    markMessagesAsRead, 
    clearAllUnreadMessages,
    resetChatState
} = chatSlice.actions;
export default chatSlice.reducer;