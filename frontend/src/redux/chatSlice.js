import { createSlice } from "@reduxjs/toolkit";

const normalizeObjectId = (value) => {
    if (!value) return '';

    if (typeof value === 'string') {
        const match = value.match(/[a-f\d]{24}/i);
        return match ? match[0] : value;
    }

    if (typeof value === 'number') {
        return String(value);
    }

    if (typeof value === 'object') {
        if (value.$oid) return String(value.$oid);
        if (value._id) return normalizeObjectId(value._id);
        if (value.id) return normalizeObjectId(value.id);
        if (typeof value.toHexString === 'function') {
            return value.toHexString();
        }
        if (typeof value.toString === 'function') {
            const text = value.toString();
            const match = text.match(/[a-f\d]{24}/i);
            return match ? match[0] : text;
        }
    }

    return String(value);
};

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

            const senderId = normalizeObjectId(newMessage.senderId);
            const receiverId = normalizeObjectId(newMessage.receiverId);
            const currentUserIdStr = normalizeObjectId(currentUserId);
            const selectedUserIdStr = selectedUserId
                ? normalizeObjectId(selectedUserId)
                : (state.selectedChatUserId ? normalizeObjectId(state.selectedChatUserId) : null);
            
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
                        normalizeObjectId(msg.senderId) === senderId &&
                        normalizeObjectId(msg.receiverId) === receiverId
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
            const userId = normalizeObjectId(action.payload);
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
        },
        clearConversation:(state, action) => {
            const userId = normalizeObjectId(action.payload);
            // Clear messages (they'll be refetched or are already deleted)
            state.messages = [];
            // Clear unread messages for this user
            if (state.unreadMessages && state.unreadMessages[userId]) {
                delete state.unreadMessages[userId];
            }
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
    resetChatState,
    clearConversation
} = chatSlice.actions;
export default chatSlice.reducer;