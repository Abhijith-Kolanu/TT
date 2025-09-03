import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { setSelectedUser } from '@/redux/authSlice';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { MessageCircleCode } from 'lucide-react';
import Messages from './Messages';
import axios from 'axios';
import { setMessages, markMessagesAsRead, addNewMessage } from '@/redux/chatSlice';
import { getUserInitials } from '@/lib/utils';

const ChatPage = () => {
    const [textMessage, setTextMessage] = useState("");
    const { user, suggestedUsers, selectedUser } = useSelector(store => store.auth);
    const { onlineUsers, messages, unreadMessages } = useSelector(store => store.chat);
    const dispatch = useDispatch();
    const location = useLocation();

    const sendMessageHandler = async (receiverId) => {
        try {
            const res = await axios.post(`http://localhost:8000/api/v1/message/send/${receiverId}`, { textMessage }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                // For sent messages, add directly to messages without affecting unread count
                dispatch(addNewMessage({ 
                    newMessage: res.data.newMessage, 
                    currentUserId: user?._id 
                }));
                setTextMessage("");
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        // If user was passed via navigation state, set as selected user
        if (location.state?.selectedUser) {
            dispatch(setSelectedUser(location.state.selectedUser));
            dispatch(markMessagesAsRead(location.state.selectedUser._id));
        }
        
        return () => {
            dispatch(setSelectedUser(null));
        }
    },[location.state, dispatch]);

    return (
        <div className='flex ml-[16%] h-screen bg-white dark:bg-gray-900 transition-colors duration-200'>
            <section className='w-full md:w-1/4 my-8'>
                <h1 className='font-bold mb-4 px-3 text-xl text-gray-900 dark:text-white'>{user?.username}</h1>
                <hr className='mb-4 border-gray-300 dark:border-gray-700' />
                <div className='overflow-y-auto h-[80vh]'>
                    {
                        suggestedUsers.map((suggestedUser) => {
                            const isOnline = onlineUsers.includes(suggestedUser?._id);
                            const unreadCount = unreadMessages?.[suggestedUser._id] || 0;
                            return (
                                <div key={suggestedUser._id} onClick={() => {
                                    dispatch(setSelectedUser(suggestedUser));
                                    // Mark messages from this user as read
                                    dispatch(markMessagesAsRead(suggestedUser._id));
                                }} className='flex gap-3 items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200 relative'>
                                    <Avatar className='w-14 h-14'>
                                        <AvatarImage src={suggestedUser?.profilePicture} />
                                        <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold">
                                            {getUserInitials(suggestedUser?.username)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className='flex flex-col flex-1'>
                                        <span className='font-medium text-gray-900 dark:text-white'>{suggestedUser?.username}</span>
                                        <span className={`text-xs font-bold ${isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} `}>{isOnline ? 'online' : 'offline'}</span>
                                    </div>
                                    {unreadCount > 0 && (
                                        <div className="bg-blue-500 text-white text-xs rounded-full min-w-[20px] h-5 px-2 flex items-center justify-center font-semibold shadow-md">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </div>
                                    )}
                                </div>
                            )
                        })
                    }
                </div>

            </section>
            {
                selectedUser ? (
                    <section className='flex-1 border-l border-l-gray-300 dark:border-l-gray-700 flex flex-col h-full'>
                        <div className='flex gap-3 items-center px-3 py-2 border-b border-gray-300 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10 transition-colors duration-200'>
                            <Avatar>
                                <AvatarImage src={selectedUser?.profilePicture} alt='profile' />
                                <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold">
                                    {getUserInitials(selectedUser?.username)}
                                </AvatarFallback>
                            </Avatar>
                            <div className='flex flex-col'>
                                <span className='text-gray-900 dark:text-white'>{selectedUser?.username}</span>
                            </div>
                        </div>
                        <Messages selectedUser={selectedUser} />
                        <div className='flex items-center p-4 border-t border-t-gray-300 dark:border-t-gray-700'>
                            <Input value={textMessage} onChange={(e) => setTextMessage(e.target.value)} type="text" className='flex-1 mr-2 focus-visible:ring-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600' placeholder="Messages..." />
                            <Button onClick={() => sendMessageHandler(selectedUser?._id)}>Send</Button>
                        </div>
                    </section>
                ) : (
                    <div className='flex flex-col items-center justify-center mx-auto'>
                        <MessageCircleCode className='w-32 h-32 my-4 text-gray-600 dark:text-gray-400' />
                        <h1 className='font-medium text-gray-900 dark:text-white'>Your messages</h1>
                        <span className='text-gray-600 dark:text-gray-400'>Send a message to start a chat.</span>
                    </div>
                )
            }
        </div>
    )
}

export default ChatPage