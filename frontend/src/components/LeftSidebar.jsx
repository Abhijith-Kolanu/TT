import { Heart, Home, LogOut, MessageCircle, PlusSquare, Search, TrendingUp, Footprints, Plane } from 'lucide-react';
import React, { useState, useEffect } from 'react'; // 1. Import useEffect
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';
import CreatePost from './CreatePost';
import { setPosts, setSelectedPost } from '@/redux/postSlice';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import SearchComponent from './SearchComponent';
import ThemeToggle from './ThemeToggle';
import { getUserInitials } from '@/lib/utils';
import useGetAllNotifications from '@/hooks/useGetAllNotifications';

const LeftSidebar = () => {
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);
    const { unreadMessages } = useSelector(store => store.chat);
    const { unreadCount: notificationUnreadCount, notifications } = useSelector(store => store.notification);
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    
    // Fetch notifications
    useGetAllNotifications();
    
    // Calculate total unread count from unreadMessages object
    const unreadCount = unreadMessages ? Object.values(unreadMessages).reduce((total, count) => total + count, 0) : 0;

    const logoutHandler = async () => {
        // ... (your existing logoutHandler code is perfect, no changes needed)
        try {
            const res = await axios.get('http://localhost:8000/api/v1/user/logout', { withCredentials: true });
            if (res.data.success) {
                dispatch(setAuthUser(null));
                dispatch(setSelectedPost(null));
                dispatch(setPosts([]));
                navigate("/login");
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    const sidebarHandler = (textType) => {
        // ... (your existing sidebarHandler code is perfect, no changes needed)
        if (textType === 'Logout') logoutHandler();
        else if (textType === "Create") setOpen(true);
        else if (textType === "Profile") navigate(`/profile/${user?._id}`);
        else if (textType === "Home") navigate("/");
        else if (textType === "Explore") navigate("/explore");
        else if (textType === 'Messages') navigate("/chat");
        else if (textType == 'Notifications') navigate("/notifications")
        else if (textType == 'Footsteps') navigate("/footsteps")
        else if (textType == 'Trip Planner') navigate("/planner")
    };

    const sidebarItems = [
        // ... (your existing sidebarItems array is perfect, no changes needed)
        { icon: <Home />, text: "Home" },
        { text: "Search" },
        { icon: <TrendingUp />, text: "Explore" },
        { icon: <Plane />, text: "Trip Planner" },
        { icon: <MessageCircle />, text: "Messages" },
        { icon: <Heart />, text: "Notifications" },
        { icon: <PlusSquare />, text: "Create" },
        {icon: <Footprints/>, text:"Footsteps"},
        {
            icon: (
                <Avatar className='w-6 h-6'>
                    <AvatarImage src={user?.profilePicture} alt="@shadcn" />
                    <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-xs">
                        {getUserInitials(user?.username)}
                    </AvatarFallback>
                </Avatar>
            ),
            text: "Profile"
        },
        { icon: <LogOut />, text: "Logout" },
    ];

    return (
        <div className='fixed top-0 z-10 left-0 border-r border-gray-300 dark:border-gray-700 w-64 h-screen bg-white dark:bg-gray-800 overflow-hidden lg:block hidden transition-colors duration-200'>
            <div className='flex flex-col h-full'>
                <div className='flex-shrink-0 px-6 py-8 border-b border-gray-200 dark:border-gray-700'>
                    <div className='flex items-center justify-between'>
                        <h1 className='font-bold text-2xl text-gray-900 dark:text-white'>TrekTales</h1>
                        <ThemeToggle />
                    </div>
                </div>
                <div className='flex-1 overflow-y-auto px-6 py-4 sidebar-scroll'>
                    {sidebarItems.map((item, index) => {
                        if (item.text === 'Search') {
                            return (
                                <div key={index} className='flex items-center gap-4 relative p-4 my-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200'>
                                    <SearchComponent />
                                </div>
                            );
                        }

                        return (
                            <div onClick={() => sidebarHandler(item.text)} key={index} className='flex items-center gap-4 relative hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-lg p-4 my-2 transition-colors duration-200'>
                                <div className='w-6 h-6 flex items-center justify-center text-gray-600 dark:text-gray-400 relative'>
                                    {item.icon}
                                    
                                    {/* Messages unread counter - positioned on top-right of icon */}
                                    {item.text === "Messages" && unreadCount > 0 && (
                                        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-semibold shadow-lg border-2 border-white dark:border-gray-800">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </div>
                                    )}
                                    
                                    {/* Notifications counter - positioned on top-right of icon */}
                                    {item.text === "Notifications" && notificationUnreadCount > 0 && (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-semibold shadow-lg border-2 border-white dark:border-gray-800 cursor-pointer">
                                                    {notificationUnreadCount > 99 ? '99+' : notificationUnreadCount}
                                                </div>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-64 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                                <div>
                                                    {!notifications || notifications.length === 0 ? (
                                                        <p className="text-gray-700 dark:text-gray-300">No new notifications</p>
                                                    ) : (
                                                        notifications.map((notification) => {
                                                            let message = '';
                                                            if (notification.type === 'like') {
                                                                message = 'liked your post';
                                                            } else if (notification.type === 'comment') {
                                                                message = 'commented on your post';
                                                            } else if (notification.type === 'follow') {
                                                                message = 'started following you';
                                                            } else if (notification.type === 'bookmark') {
                                                                message = 'bookmarked your post';
                                                            } else {
                                                                message = 'interacted with your content';
                                                            }
                                                            
                                                            return (
                                                                <div key={notification._id} className='flex items-center gap-2 my-2'>
                                                                    <Avatar>
                                                                        <AvatarImage src={notification.sender?.profilePicture} />
                                                                        <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold">
                                                                            {getUserInitials(notification.sender?.username)}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <p className='text-sm text-gray-700 dark:text-gray-300'>
                                                                        <span className='font-bold'>{notification.sender?.username}</span> {message}
                                                                    </p>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                </div>
                                <span className='text-gray-700 dark:text-gray-300 font-medium text-base'>{item.text}</span>

                            </div>
                        );
                    })}
                </div>
            </div>
            <CreatePost open={open} setOpen={setOpen} />
        </div>
    );
};

export default LeftSidebar;