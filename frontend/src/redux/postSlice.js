import { createSlice } from "@reduxjs/toolkit";

const postSlice = createSlice({
    name: 'post',
    initialState: {
        posts: [],
        selectedPost: null,
        // 1. ADD THE 'explorePosts' PROPERTY TO YOUR INITIAL STATE
        explorePosts: null, 
    },
    reducers: {
        // --- Existing Actions ---
        setPosts: (state, action) => {
            state.posts = action.payload;
        },
        setSelectedPost: (state, action) => {
            state.selectedPost = action.payload;
        },

        // --- 2. ADD THE NEW ACTION FOR THE EXPLORE PAGE ---
        setExplorePosts: (state, action) => {
            state.explorePosts = action.payload;
        }
    }
});

// 3. EXPORT THE NEW ACTION
export const { setPosts, setSelectedPost, setExplorePosts } = postSlice.actions;
export default postSlice.reducer;