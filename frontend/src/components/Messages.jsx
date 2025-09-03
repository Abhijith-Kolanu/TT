import React, { useEffect, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import useGetAllMessage from '@/hooks/useGetAllMessage'
import { getUserInitials } from '@/lib/utils'
import { markMessagesAsRead } from '@/redux/chatSlice'

const Messages = ({ selectedUser }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    useGetAllMessage();
    const {messages} = useSelector(store=>store.chat);
    const {user} = useSelector(store=>store.auth);
    
    // Function to scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Mark messages as read when this component mounts or selectedUser changes
    useEffect(() => {
        if (selectedUser?._id) {
            dispatch(markMessagesAsRead(selectedUser._id));
        }
    }, [selectedUser?._id, dispatch]);
    
    // Auto-scroll when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    // Auto-scroll when component mounts
    useEffect(() => {
        scrollToBottom();
    }, []);
    return (    
        <div ref={messagesContainerRef} className='overflow-y-auto flex-1 p-4 bg-white dark:bg-gray-900 transition-colors duration-200 hide-scrollbar'>
            <div className='flex justify-center'>
                <div className='flex flex-col items-center justify-center'>
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={selectedUser?.profilePicture} alt='profile' />
                        <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-xl">
                            {getUserInitials(selectedUser?.username)}
                        </AvatarFallback>
                    </Avatar>
                    <span className='text-gray-900 dark:text-white font-medium'>{selectedUser?.username}</span>
                    <Link to={`/profile/${selectedUser?._id}`}><Button className="h-8 my-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700" variant="secondary">View profile</Button></Link>
                </div>
            </div>
            <div className='flex flex-col gap-3'>
                {
                   messages && messages.map((msg) => {
                        return (
                            <div key={msg._id} className={`flex ${msg.senderId === user?._id ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-2 rounded-lg ${msg.messageType === 'post' ? 'max-w-sm' : 'max-w-xs'} break-words ${msg.senderId === user?._id ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'}`}>
                                    {msg.messageType === 'post' && msg.sharedPost ? (
                                        <div className="flex flex-col space-y-2">
                                            <div className="text-sm opacity-80">
                                                {msg.senderId === user?._id ? 'You shared a post' : 'Shared a post'}
                                            </div>
                                            <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={msg.sharedPost.author?.profilePicture} alt="profile" />
                                                        <AvatarFallback className="text-xs">
                                                            {getUserInitials(msg.sharedPost.author?.username)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {msg.sharedPost.author?.username}
                                                    </span>
                                                </div>
                                                {msg.sharedPost.image && (
                                                    <img 
                                                        src={msg.sharedPost.image} 
                                                        alt="Shared post" 
                                                        className="w-full h-32 object-cover rounded mb-2"
                                                    />
                                                )}
                                                {msg.sharedPost.caption && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                                        {msg.sharedPost.caption}
                                                    </p>
                                                )}
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="mt-2 text-xs"
                                                    onClick={() => navigate(`/post/${msg.sharedPost._id}`)}
                                                >
                                                    View Post
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        msg.message
                                    )}
                                </div>
                            </div>
                        )
                    })
                }
                {/* This div is for auto-scrolling to the bottom */}
                <div ref={messagesEndRef} />
            </div>
        </div>  
    )
}

export default Messages