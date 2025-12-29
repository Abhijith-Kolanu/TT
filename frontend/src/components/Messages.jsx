import React, { useEffect, useRef, useLayoutEffect } from 'react'
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
    const initialScrollDoneRef = useRef(false);
    const previousUserRef = useRef(null);
    
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
        messagesEndRef.current?.scrollIntoView({ behavior: behavior === 'instant' ? 'auto' : behavior });
    };

    // Function to check if user is near bottom of scroll
    const isNearBottom = () => {
        const scrollContainer = messagesContainerRef.current?.parentElement;
        if (!scrollContainer) return true;
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        return scrollHeight - scrollTop - clientHeight < 100;
    };

    // Reset when selected user changes
    useEffect(() => {
        if (selectedUser?._id !== previousUserRef.current) {
            initialScrollDoneRef.current = false;
            lastMessageCountRef.current = 0;
            previousUserRef.current = selectedUser?._id;
        }
    }, [selectedUser?._id]);

    // Scroll to bottom when messages load for the first time for this user
    useEffect(() => {
        if (messages && messages.length > 0 && !initialScrollDoneRef.current) {
            // Use multiple timeouts to ensure DOM is fully rendered
            const timer1 = setTimeout(() => scrollToBottom('instant'), 0);
            const timer2 = setTimeout(() => scrollToBottom('instant'), 100);
            const timer3 = setTimeout(() => {
                scrollToBottom('instant');
                initialScrollDoneRef.current = true;
                lastMessageCountRef.current = messages.length;
            }, 200);
            
            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
                clearTimeout(timer3);
            };
        }
    }, [messages]);
    
    // Smart auto-scroll when new messages arrive (after initial load)
    useEffect(() => {
        if (messages && messages.length > 0 && initialScrollDoneRef.current) {
            // Only auto-scroll if this is a new message and user is near bottom
            if (messages.length > lastMessageCountRef.current && isNearBottom()) {
                scrollToBottom('smooth');
            }
            lastMessageCountRef.current = messages.length;
        }
    }, [messages]);

    return (    
        <div ref={messagesContainerRef} className='min-h-full p-4 bg-transparent'>
            <div className='flex flex-col gap-3'>
                {
                                     messages && messages.map((msg, idx) => {
                    // Use msg._id if available, otherwise fallback to index (should not happen in production)
                    const key = msg._id || `msg-${idx}`;
                    // Robustly extract senderId as string
                    let senderIdStr = '';
                    if (typeof msg.senderId === 'object' && msg.senderId !== null) {
                        // Handle Mongoose ObjectId serialization (e.g., { $oid: '...' })
                        if (msg.senderId.$oid) {
                            senderIdStr = msg.senderId.$oid;
                        } else if (msg.senderId.toHexString) {
                            senderIdStr = msg.senderId.toHexString();
                        } else if (msg.senderId._id) {
                            senderIdStr = msg.senderId._id;
                        } else {
                            senderIdStr = String(msg.senderId);
                        }
                    } else {
                        senderIdStr = String(msg.senderId || '');
                    }
                    const userIdStr = (user?._id && user._id.toString) ? user._id.toString() : String(user?._id || '');
                    const isCurrentUserSender = senderIdStr === userIdStr;
                                        // Enhanced debug output (console only)
                                        if (!msg.senderId) {
                                            console.warn('[Message Alignment Warning] senderId missing for message:', msg);
                                        }
                                        const debugInfo = {
                                            msgSenderId: msg.senderId,
                                            currentUserId: user?._id,
                                            senderIdStr,
                                            userIdStr,
                                            isCurrentUserSender
                                        };
                                        if (window && window.console) {
                                            if (isCurrentUserSender) {
                                                console.log('%c[SENDER]', 'color: green; font-weight: bold;', debugInfo);
                                            } else {
                                                console.log('%c[RECEIVER]', 'color: blue; font-weight: bold;', debugInfo);
                                            }
                                        }
                                        return (
                                                <div key={key}>
                                                    <div className={`flex ${isCurrentUserSender ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`p-2 rounded-lg ${msg.messageType === 'post' ? 'max-w-sm' : 'max-w-xs'} break-words ${isCurrentUserSender ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'}`}>
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
                                                                                        </div>
                                                                                );
                    })
                }
                {/* This div is for auto-scrolling to the bottom */}
                <div ref={messagesEndRef} />
            </div>
        </div>  
    )
}

export default Messages