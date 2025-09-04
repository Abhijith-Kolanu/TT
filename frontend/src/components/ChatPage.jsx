import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { setSelectedUser } from '@/redux/authSlice';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { MessageCircleCode, MessageCircle } from 'lucide-react';
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
    const navigate = useNavigate();

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
        <div className='flex h-screen bg-gradient-to-br from-white via-blue-50/30 to-green-50/30 dark:from-gray-900 dark:via-blue-950/30 dark:to-green-950/30 transition-all duration-300'>
            <section className='w-full md:w-1/4 my-8 adventure-card mx-4 relative max-h-screen'>
                {/* Decorative background */}
                <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-400/10 to-green-400/10 rounded-full blur-2xl'></div>
                <div className='absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-400/10 to-yellow-400/10 rounded-full blur-xl'></div>
                
                <div className='relative z-10 p-6 h-full flex flex-col min-h-0'>
                    <div className='flex items-center gap-3 mb-6'>
                        <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center'>
                            <MessageCircle className='w-4 h-4 text-white' />
                        </div>
                        <h1 className='adventure-title text-xl font-bold'>{user?.username}</h1>
                    </div>
                    
                    <hr className='mb-6 border-blue-200/30 dark:border-blue-700/30' />
                    
                    <div className='flex-1 overflow-y-auto adventure-scroll'>
                        {
                            suggestedUsers.map((suggestedUser) => {
                                const isOnline = onlineUsers.includes(suggestedUser?._id);
                                const unreadCount = unreadMessages?.[suggestedUser._id] || 0;
                                const isSelected = selectedUser?._id === suggestedUser._id;
                                return (
                                    <div key={suggestedUser._id} onClick={() => {
                                        dispatch(setSelectedUser(suggestedUser));
                                        // Mark messages from this user as read
                                        dispatch(markMessagesAsRead(suggestedUser._id));
                                    }} className={`group relative p-4 mb-3 rounded-2xl cursor-pointer transition-all duration-300 border ${
                                        isSelected 
                                            ? 'bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/30 dark:to-green-900/30 border-blue-300/50 dark:border-blue-600/50 shadow-lg transform scale-[1.02]' 
                                            : 'hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-green-50/50 dark:hover:from-blue-900/20 dark:hover:to-green-900/20 border-transparent hover:border-blue-200/30 dark:hover:border-blue-700/30 hover:shadow-md hover:transform hover:scale-[1.01]'
                                    }`}>
                                        {/* Active indicator */}
                                        {isSelected && (
                                            <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-green-500 rounded-r-full'></div>
                                        )}
                                        
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <Avatar className='w-12 h-12 ring-2 ring-white dark:ring-gray-800 shadow-md'>
                                                    <AvatarImage src={suggestedUser?.profilePicture} />
                                                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                                                        {getUserInitials(suggestedUser?.username)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {/* Online status indicator */}
                                                {isOnline && (
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 border-2 border-white dark:border-gray-800 rounded-full shadow-sm pulse-adventure"></div>
                                                )}
                                            </div>
                                            <div className='flex flex-col flex-1 min-w-0'>
                                                <span className='font-semibold text-gray-900 dark:text-white truncate'>{suggestedUser?.username}</span>
                                                <span className={`text-xs font-medium flex items-center gap-1 ${isOnline ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'} `}>
                                                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                                    {isOnline ? 'Active now' : 'Offline'}
                                                </span>
                                            </div>
                                            {unreadCount > 0 && (
                                                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs rounded-full min-w-[24px] h-6 px-2 flex items-center justify-center font-bold shadow-lg transform transition-transform duration-200 pulse-adventure">
                                                    {unreadCount > 99 ? '99+' : unreadCount}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </section>
            {
                selectedUser ? (
                    <section className='flex-1 flex flex-col ml-4 mr-4 my-8 max-h-screen'>
                        <div className='adventure-card flex-1 flex flex-col relative min-h-0'>
                            {/* Decorative background */}
                            <div className='absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-purple-400/5 to-blue-400/5 rounded-full blur-3xl'></div>
                            <div className='absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-green-400/5 to-blue-400/5 rounded-full blur-2xl'></div>
                            
                            {/* Header */}
                            <div className='relative z-10 flex gap-4 items-center p-6 border-b border-blue-200/30 dark:border-blue-700/30 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors duration-200'
                                 onClick={() => navigate(`/profile/${selectedUser?._id}`)}>
                                <Avatar className='w-12 h-12 ring-2 ring-blue-200 dark:ring-blue-700'>
                                    <AvatarImage src={selectedUser?.profilePicture} alt='profile' />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                                        {getUserInitials(selectedUser?.username)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className='flex flex-col'>
                                    <span className='text-gray-900 dark:text-white font-semibold text-lg'>{selectedUser?.username}</span>
                                    <span className='text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors'>Click to view profile</span>
                                </div>
                                <div className='ml-auto flex items-center gap-2'>
                                    <div className='nav-dot active'></div>
                                    <div className='nav-dot'></div>
                                    <div className='nav-dot'></div>
                                </div>
                            </div>
                            
                            {/* Messages */}
                            <div className='relative z-10 flex-1 overflow-y-auto adventure-scroll min-h-0'>
                                <Messages selectedUser={selectedUser} />
                            </div>
                            
                            {/* Input */}
                            <div className='relative z-10 p-6 border-t border-blue-200/30 dark:border-blue-700/30'>
                                <div className='flex items-center gap-3'>
                                    <Input 
                                        value={textMessage} 
                                        onChange={(e) => setTextMessage(e.target.value)} 
                                        type="text" 
                                        className='flex-1 h-12 rounded-2xl border-blue-200/50 dark:border-blue-700/50 focus:border-blue-400 dark:focus:border-blue-500 focus-visible:ring-blue-200 dark:focus-visible:ring-blue-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400' 
                                        placeholder="Type your message..." 
                                    />
                                    <Button 
                                        onClick={() => sendMessageHandler(selectedUser?._id)}
                                        className="btn-adventure h-12 px-6 rounded-2xl"
                                    >
                                        Send
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>
                ) : (
                    <div className='flex-1 flex flex-col items-center justify-center mx-auto'>
                        <div className='adventure-card p-12 text-center max-w-md'>
                            <div className='w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full flex items-center justify-center mx-auto mb-6'>
                                <MessageCircleCode className='w-12 h-12 text-blue-500 dark:text-blue-400' />
                            </div>
                            <h1 className='adventure-title text-2xl font-bold mb-2'>Your Messages</h1>
                            <span className='text-gray-600 dark:text-gray-400 leading-relaxed'>Select a conversation to start chatting, or search for someone new to connect with.</span>
                            <div className='flex justify-center mt-6 space-x-2'>
                                <div className='nav-dot active'></div>
                                <div className='nav-dot'></div>
                                <div className='nav-dot'></div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    )
}

export default ChatPage