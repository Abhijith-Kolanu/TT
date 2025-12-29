import { setMessages, addNewMessage } from "@/redux/chatSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetRTM = () => {
    const dispatch = useDispatch();
    const { socket } = useSelector(store => store.socketio);
    const { messages, selectedChatUserId } = useSelector(store => store.chat);
    const { user } = useSelector(store => store.auth);
    
    useEffect(() => {
        socket?.on('newMessage', (newMessage) => {
            // Use addNewMessage to handle unread count tracking
            // selectedChatUserId is read from state in the reducer
            dispatch(addNewMessage({ 
                newMessage, 
                currentUserId: user?._id 
            }));
        })

        return () => {
            socket?.off('newMessage');
        }
    }, [dispatch, socket, user?._id]);
};
export default useGetRTM;