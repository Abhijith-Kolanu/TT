import { setPosts, setFollowingEndIndex } from "@/redux/postSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";


const useGetAllPost = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        const fetchAllPost = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/post/all`, { withCredentials: true });
                if (res.data.success) { 
                    dispatch(setPosts(res.data.posts));
                    dispatch(setFollowingEndIndex(res.data.followingEndIndex ?? 0));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllPost();
    }, []);
};
export default useGetAllPost;