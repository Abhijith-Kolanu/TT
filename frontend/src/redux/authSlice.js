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
            const normalizeId = (value) => {
                if (!value) return '';
                if (typeof value === 'string') return value;
                if (typeof value === 'object' && value._id) return String(value._id);
                return String(value);
            };
            const normalizedTargetId = normalizeId(targetId);

            state.user.following = (state.user.following || []).map(id => normalizeId(id));

            if (follow) {
                if (!state.user.following.includes(normalizedTargetId)) {
                    state.user.following.push(normalizedTargetId);
                }
            } else {
                state.user.following = state.user.following.filter(id => id !== normalizedTargetId);
            }
        },
        prependUserProfilePost:(state, action) => {
            const newPost = action.payload;
            if (!newPost) return;
            if (!state.userProfile) return;

            const normalizeId = (value) => {
                if (!value) return '';
                if (typeof value === 'string') return value;
                if (typeof value === 'object' && value._id) return String(value._id);
                return String(value);
            };

            const profileId = normalizeId(state.userProfile._id);
            const postAuthorId = normalizeId(newPost.author?._id || newPost.author);
            if (profileId !== postAuthorId) return;

            const existingIds = new Set((state.userProfile.posts || []).map((post) => normalizeId(post?._id || post)));
            if (existingIds.has(normalizeId(newPost._id))) return;

            state.userProfile.posts = [newPost, ...(state.userProfile.posts || [])];
        },
        removeUserProfilePostById:(state, action) => {
            const postId = action.payload;
            if (!state.userProfile || !postId) return;

            const normalizeId = (value) => {
                if (!value) return '';
                if (typeof value === 'string') return value;
                if (typeof value === 'object' && value._id) return String(value._id);
                return String(value);
            };

            const targetId = normalizeId(postId);
            state.userProfile.posts = (state.userProfile.posts || []).filter(
                (post) => normalizeId(post?._id || post) !== targetId
            );
        },
        updateUserProfilePostCaption:(state, action) => {
            const { postId, caption } = action.payload || {};
            if (!state.userProfile || !postId) return;

            const normalizeId = (value) => {
                if (!value) return '';
                if (typeof value === 'string') return value;
                if (typeof value === 'object' && value._id) return String(value._id);
                return String(value);
            };

            const targetId = normalizeId(postId);
            state.userProfile.posts = (state.userProfile.posts || []).map((post) =>
                normalizeId(post?._id || post) === targetId ? { ...post, caption } : post
            );
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
    prependUserProfilePost,
    removeUserProfilePostById,
    updateUserProfilePostCaption,
    setAuthChecked
} = authSlice.actions;
export default authSlice.reducer;