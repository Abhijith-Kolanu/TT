import { useEffect } from "react";
import axios from "axios"; // Make sure axios is imported
import { useDispatch } from "react-redux";
import { setExplorePosts } from "@/redux/postSlice";

const useGetExplorePosts = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchExplorePosts = async () => {
            try {
                // The API call to your backend
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/post/explore`, { 
                    withCredentials: true 
                });
                
                // If the request is successful, dispatch the posts to the Redux store
                if (res.data.success) {
                    dispatch(setExplorePosts(res.data.posts));
                }
            } catch (error) {
                // If there's an error, log it to the console for debugging
                console.error("Error fetching explore posts:", error);
                
                // Optional: You could dispatch an empty array to stop the loading state
                // dispatch(setExplorePosts([])); 
            }
        };

        fetchExplorePosts();
    }, [dispatch]); // The effect depends on the dispatch function

    // A custom hook for logic doesn't need to return any JSX
};

export default useGetExplorePosts;