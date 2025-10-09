import { setUserProfile } from "@/redux/authSlice";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";


const useGetUserProfile = (userId) => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        if (!userId) return;
        
        const fetchUserProfile = async () => {
            try {
                setIsLoading(true);
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/user/${userId}/profile`, { withCredentials: true });
                if (res.data.success) { 
                    dispatch(setUserProfile(res.data.user));
                }
            } catch (error) {
                console.log(error);
                dispatch(setUserProfile(null));
            } finally {
                setIsLoading(false);
            }
        }
        fetchUserProfile();
    }, [userId, dispatch]);
    
    return { isLoading };
};
export default useGetUserProfile;