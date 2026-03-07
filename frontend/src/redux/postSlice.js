import { createSlice } from "@reduxjs/toolkit";

const postSlice = createSlice({
    name: 'post',
    initialState: {
        posts: [],
        selectedPost: null,
        followingEndIndex: 0,
    },
    reducers: {
        setPosts: (state, action) => {
            state.posts = action.payload;
        },
        setSelectedPost: (state, action) => {
            state.selectedPost = action.payload;
        },
        setFollowingEndIndex: (state, action) => {
            state.followingEndIndex = action.payload;
        },
    }
});

export const { setPosts, setSelectedPost, setFollowingEndIndex } = postSlice.actions;
export default postSlice.reducer;