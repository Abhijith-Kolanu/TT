import { setNotifications } from "@/redux/notificationSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetAllNotifications = () => {
    const dispatch = useDispatch();
    
    useEffect(() => {
        const fetchAllNotifications = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/notification/all`, { 
                    withCredentials: true 
                });
                if (res.data.success) {
                    dispatch(setNotifications(res.data.notifications));
                }
            } catch (error) {
                console.log("Error fetching notifications:", error);
            }
        };
        
        fetchAllNotifications();
    }, [dispatch]);
};

export default useGetAllNotifications;
