import { setMessages, markMessagesAsRead, setSelectedChatUserId } from "@/redux/chatSlice";
import { setPosts } from "@/redux/postSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetAllMessage = () => {
    const dispatch = useDispatch();
    const {selectedUser} = useSelector(store=>store.auth);
    useEffect(() => {
        const fetchAllMessage = async () => {
            // Clear messages first when switching users to prevent showing wrong messages
            dispatch(setMessages([]));
            
            if (!selectedUser?._id) {
                dispatch(setSelectedChatUserId(null));
                return;
            }
            
            // Update the selected chat user ID
            dispatch(setSelectedChatUserId(selectedUser._id));
            
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/message/all/${selectedUser?._id}`, { withCredentials: true });
                if (res.data.success) {  
                    dispatch(setMessages(res.data.messages));
                    dispatch(markMessagesAsRead(selectedUser._id));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllMessage();
    }, [selectedUser?._id, dispatch]);
};
export default useGetAllMessage;