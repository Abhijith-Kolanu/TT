import {createSlice} from "@reduxjs/toolkit"

const authSlice = createSlice({
    name:"auth",
    initialState:{
        user:null,
        suggestedUsers:[],
        userProfile:null,
        selectedUser:null,
        authChecked: false,
    },
    reducers:{
        // actions
        setAuthUser:(state,action) => {
            state.user = action.payload;
        },
        setSuggestedUsers:(state,action) => {
            state.suggestedUsers = action.payload;
        },
        setUserProfile:(state,action) => {
            state.userProfile = action.payload;
        },
        setSelectedUser:(state,action) => {
            state.selectedUser = action.payload;
        },
        updateUserBookmarks:(state,action) => {
            if(state.user) {
                state.user.bookmarks = action.payload;
            }
        },
        removeFromSuggestedUsers:(state,action) => {
            const userId = action.payload;
            state.suggestedUsers = state.suggestedUsers.filter(user => user._id !== userId);
        },
        updateFollowing:(state,action) => {
            // action.payload = { targetId, follow: true|false }
            if (!state.user) return;
            const { targetId, follow } = action.payload;
            if (follow) {
                if (!state.user.following.includes(targetId)) {
                    state.user.following.push(targetId);
                }
            } else {
                state.user.following = state.user.following.filter(id => id !== targetId);
            }
        },
        setAuthChecked:(state) => {
            state.authChecked = true;
        }
    }
});
export const {
    setAuthUser, 
    setSuggestedUsers, 
    setUserProfile,
    setSelectedUser,
    updateUserBookmarks,
    removeFromSuggestedUsers,
    updateFollowing,
    setAuthChecked
} = authSlice.actions;
export default authSlice.reducer;