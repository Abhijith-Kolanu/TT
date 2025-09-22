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
    const lastMessageCountRef = useRef(0);
    useGetAllMessage();
    const {messages} = useSelector(store=>store.chat);
    const {user} = useSelector(store=>store.auth);
    
    // Function to scroll to bottom
    const scrollToBottom = (behavior = 'smooth') => {
        // Scroll the parent container that has the overflow
        const scrollContainer = messagesContainerRef.current?.parentElement;
        if (scrollContainer) {
            if (behavior === 'instant') {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            } else {
                scrollContainer.scrollTo({
                    top: scrollContainer.scrollHeight,
                    behavior: behavior
                });
            }
        }
        // Also scroll to the bottom element
        messagesEndRef.current?.scrollIntoView({ behavior: behavior });
    };

    // Function to check if user is near bottom of scroll
    const isNearBottom = () => {
        // Get the parent container that actually has the scroll (the ChatPage messages container)
        const scrollContainer = messagesContainerRef.current?.parentElement;
        if (!scrollContainer) return true;
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        return scrollHeight - scrollTop - clientHeight < 100; // Within 100px of bottom
    };

    
    // Smart auto-scroll when messages change
    useEffect(() => {
        if (messages && messages.length > 0) {
            // Only auto-scroll if this is a new message and user is near bottom
            if (messages.length > lastMessageCountRef.current && isNearBottom()) {
                scrollToBottom();
            }
            lastMessageCountRef.current = messages.length;
        }
    }, [messages]);
    
    // Auto-scroll when component mounts or user changes - ALWAYS scroll to bottom
    useEffect(() => {
        // Use instant scroll for immediate display when switching users
        const timer = setTimeout(() => {
            scrollToBottom('instant');
            lastMessageCountRef.current = messages?.length || 0;
        }, 50);
        
        return () => clearTimeout(timer);
    }, [selectedUser?._id]);
    
    // Also scroll to bottom when messages first load for a user
    useEffect(() => {
        if (messages && messages.length > 0 && lastMessageCountRef.current === 0) {
            const timer = setTimeout(() => {
                scrollToBottom('instant');
            }, 50);
            
            return () => clearTimeout(timer);
        }
    }, [messages]);
    return (    
        <div ref={messagesContainerRef} className='min-h-full p-4 bg-transparent'>
            <div className='flex flex-col gap-3'>
                {
                                     messages && messages.map((msg, idx) => {
                                                // Debug log for sender/receiver alignment
                                                console.log('Message debug:', {
                                                    msgSenderId: msg.senderId,
                                                    currentUserId: user?._id,
                                                    isCurrentUserSender: msg.senderId === user?._id
                                                });
                                                // Use msg._id if available, otherwise fallback to index (should not happen in production)
                                                const key = msg._id || `msg-${idx}`;
                                                return (
                                                        <div key={key} className={`flex ${msg.senderId === user?._id ? 'justify-end' : 'justify-start'}`}>
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