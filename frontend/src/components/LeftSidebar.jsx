import { Heart, Home, LogOut, MessageCircle, PlusSquare, Search, TrendingUp, Footprints, Plane, Mountain, Compass, BookOpen, Lock } from 'lucide-react';
import React, { useState, useEffect } from 'react'; // 1. Import useEffect
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
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
    const location = useLocation();
    const { user } = useSelector(store => store.auth);
    const { unreadMessages } = useSelector(store => store.chat);
    const { unreadCount: notificationUnreadCount, notifications } = useSelector(store => store.notification);
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    
    // Fetch notifications
    useGetAllNotifications();
    
    // Calculate total unread count from unreadMessages object
    const unreadCount = unreadMessages ? Object.values(unreadMessages).reduce((total, count) => total + count, 0) : 0;

    // Function to determine if a navigation item is active
    const isActiveRoute = (itemText) => {
        const currentPath = location.pathname;
        
        switch (itemText) {
            case 'Home':
                return currentPath === '/';
            case 'Explore':
                return currentPath === '/explore';
            case 'Trip Planner':
                return currentPath === '/planner';
            case 'Private Journal':
                return currentPath === '/journal';
            case 'Scrapbook':
                return currentPath === '/scrapbook';
            case 'Messages':
                return currentPath === '/chat';
            case 'Notifications':
                return currentPath === '/notifications';
            case 'Footsteps':
                return currentPath === '/footsteps';
            case 'Profile':
                return currentPath.startsWith('/profile');
            default:
                return false;
        }
    };

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
        else if (textType === 'Private Journal') navigate("/journal");
        else if (textType == 'Notifications') navigate("/notifications")
        else if (textType == 'Footsteps') navigate("/footsteps")
        else if (textType == 'Trip Planner') navigate("/planner")
        else if (textType == 'Scrapbook') navigate("/scrapbook")
    };

    const sidebarItems = [
        // ... (your existing sidebarItems array is perfect, no changes needed)
        { icon: <Home />, text: "Home" },
        { text: "Search" },
        { icon: <TrendingUp />, text: "Explore" },
        { icon: <Plane />, text: "Trip Planner" },
        { icon: <Lock />, text: "Private Journal" },
        { icon: <BookOpen />, text: "Scrapbook" },
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
        <div className='fixed top-0 z-10 left-0 w-64 h-screen bg-gradient-to-br from-white via-blue-50 to-green-50 dark:from-gray-900 dark:via-blue-950 dark:to-green-950 overflow-hidden lg:block hidden transition-all duration-300 border-r border-blue-200/30 dark:border-blue-800/30 travel-pattern'>
            <div className='flex flex-col h-full relative'>
                {/* Decorative Elements */}
                <div className='absolute top-20 right-4 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-green-400/20 rounded-full blur-xl'></div>
                <div className='absolute bottom-32 left-4 w-12 h-12 bg-gradient-to-br from-orange-400/20 to-yellow-400/20 rounded-full blur-lg'></div>
                
                {/* Header */}
                <div className='flex-shrink-0 px-6 py-8 relative z-10'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                            {/* Enhanced Logo with Travel Elements */}
                            <div className='relative'>
                                <div className='w-12 h-12 bg-gradient-to-br from-blue-500 via-green-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl rotate-12 hover:rotate-0 transition-all duration-500 group'>
                                    <div className='relative'>
                                        <Mountain className='w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300' />
                                        <Compass className='absolute -top-1 -right-1 w-3 h-3 text-orange-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-spin' style={{ animationDuration: '3s' }} />
                                    </div>
                                </div>
                                {/* Trail effect */}
                                <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-blue-400 rounded-full opacity-60 blur-sm'></div>
                            </div>
                            <div className='flex flex-col'>
                                <h1 className='adventure-title text-2xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-orange-600 bg-clip-text text-transparent'>TrekTales</h1>
                                <div className='flex items-center gap-1 opacity-80'>
                                    <Mountain className='w-3 h-3 text-blue-500' />
                                    <div className='w-1 h-1 bg-green-500 rounded-full'></div>
                                    <div className='w-1 h-1 bg-orange-500 rounded-full'></div>
                                    <div className='w-1 h-1 bg-blue-500 rounded-full'></div>
                                </div>
                            </div>
                        </div>
                        <ThemeToggle />
                    </div>
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-3 font-medium tracking-wide whitespace-nowrap'>🌍 Discover • 📸 Share • 🏔️ Adventure</p>
                </div>

                {/* Navigation */}
                <div className='flex-1 overflow-y-auto px-4 py-2 sidebar-scroll relative z-10'>
                    {sidebarItems.map((item, index) => {
                        if (item.text === 'Search') {
                            return (
                                <div key={index} className='mb-2'>
                                    <div className='adventure-card hover:scale-[1.02] p-4 transition-all duration-300'>
                                        <SearchComponent />
                                    </div>
                                </div>
                            );
                        }

                        const isActive = isActiveRoute(item.text);
                        
                        return (
                            <div 
                                onClick={() => sidebarHandler(item.text)} 
                                key={index} 
                                className={`group relative mb-2 cursor-pointer transition-all duration-300 ${
                                    isActive ? 'scale-105' : 'hover:scale-[1.02]'
                                }`}
                            >
                                <div className={`adventure-card p-4 flex items-center gap-4 relative overflow-hidden ${
                                    isActive 
                                        ? 'bg-gradient-to-r from-blue-500/10 to-green-500/10 dark:from-blue-400/10 dark:to-green-400/10 border-blue-300/30 dark:border-blue-600/30' 
                                        : 'hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-green-500/5 dark:hover:from-blue-400/5 dark:hover:to-green-400/5'
                                }`}>
                                    {/* Active indicator */}
                                    {isActive && (
                                        <div className='absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-green-500 rounded-r-full'></div>
                                    )}
                                    
                                    {/* Icon container */}
                                    <div className={`relative w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-300 ${
                                        isActive 
                                            ? 'bg-gradient-to-br from-blue-500 to-green-500 text-white shadow-lg' 
                                            : 'text-gray-600 dark:text-gray-400 group-hover:bg-gradient-to-br group-hover:from-blue-500/20 group-hover:to-green-500/20'
                                    }`}>
                                        <div className='w-5 h-5 flex items-center justify-center'>
                                            {item.icon}
                                        </div>
                                        
                                        {/* Messages unread counter */}
                                        {item.text === "Messages" && unreadCount > 0 && (
                                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold shadow-lg border-2 border-white dark:border-gray-800 pulse-adventure">
                                                {unreadCount > 99 ? '99+' : unreadCount}
                                            </div>
                                        )}
                                        
                                        {/* Notifications counter */}
                                        {item.text === "Notifications" && notificationUnreadCount > 0 && (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold shadow-lg border-2 border-white dark:border-gray-800 cursor-pointer pulse-adventure">
                                                        {notificationUnreadCount > 99 ? '99+' : notificationUnreadCount}
                                                    </div>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-80 adventure-card border-blue-200/30 dark:border-blue-700/30">
                                                    <div className='max-h-80 overflow-y-auto adventure-scroll'>
                                                        <h3 className='font-bold text-lg mb-4 text-gray-900 dark:text-white'>Notifications</h3>
                                                        {!notifications || notifications.length === 0 ? (
                                                            <div className='text-center py-8'>
                                                                <Heart className='w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2' />
                                                                <p className="text-gray-500 dark:text-gray-400">No new notifications</p>
                                                            </div>
                                                        ) : (
                                                            notifications.map((notification) => {
                                                                let message = '';
                                                                let icon = <Heart className='w-4 h-4' />;
                                                                let iconBg = 'from-red-500 to-pink-500';
                                                                
                                                                if (notification.type === 'like') {
                                                                    message = 'liked your post';
                                                                    icon = <Heart className='w-4 h-4' />;
                                                                    iconBg = 'from-red-500 to-pink-500';
                                                                } else if (notification.type === 'comment') {
                                                                    message = 'commented on your post';
                                                                    icon = <MessageCircle className='w-4 h-4' />;
                                                                    iconBg = 'from-blue-500 to-purple-500';
                                                                } else if (notification.type === 'follow') {
                                                                    message = 'started following you';
                                                                    icon = <PlusSquare className='w-4 h-4' />;
                                                                    iconBg = 'from-green-500 to-emerald-500';
                                                                } else if (notification.type === 'bookmark') {
                                                                    message = 'bookmarked your post';
                                                                    iconBg = 'from-yellow-500 to-orange-500';
                                                                } else {
                                                                    message = 'interacted with your content';
                                                                }
                                                                
                                                                return (
                                                                    <div key={notification._id} className='flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 mb-2'>
                                                                        <div className='relative'>
                                                                            <Avatar className='w-10 h-10 ring-2 ring-white dark:ring-gray-800'>
                                                                                <AvatarImage src={notification.sender?.profilePicture} />
                                                                                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold text-sm">
                                                                                    {getUserInitials(notification.sender?.username)}
                                                                                </AvatarFallback>
                                                                            </Avatar>
                                                                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br ${iconBg} rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 text-white`}>
                                                                                {icon}
                                                                            </div>
                                                                        </div>
                                                                        <div className='flex-1 min-w-0'>
                                                                            <p className='text-sm text-gray-700 dark:text-gray-300 leading-relaxed'>
                                                                                <span className='font-bold text-gray-900 dark:text-white'>{notification.sender?.username}</span> {message}
                                                                            </p>
                                                                            <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                                                                                {(() => {
                                                                                    if (!notification.createdAt) return 'Recently';
                                                                                    
                                                                                    const date = new Date(notification.createdAt);
                                                                                    const now = new Date();
                                                                                    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
                                                                                    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
                                                                                    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
                                                                                    
                                                                                    if (diffInMinutes < 1) return 'Now';
                                                                                    if (diffInMinutes < 60) return `${diffInMinutes}m`;
                                                                                    if (diffInHours < 24) return `${diffInHours}h`;
                                                                                    if (diffInDays < 7) return `${diffInDays}d`;
                                                                                    return date.toLocaleDateString();
                                                                                })()}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    </div>
                                    
                                    {/* Text */}
                                    <span className={`font-medium text-base transition-all duration-300 ${
                                        isActive 
                                            ? 'text-gray-900 dark:text-white font-semibold' 
                                            : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
                                    }`}>
                                        {item.text}
                                    </span>

                                    {/* Hover effect */}
                                    <div className='absolute inset-0 bg-gradient-to-r from-blue-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl'></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom decorative element */}
                <div className='flex-shrink-0 p-6 relative z-10'>
                    <div className='flex justify-center space-x-2'>
                        <div className='nav-dot active'></div>
                        <div className='nav-dot'></div>
                        <div className='nav-dot'></div>
                    </div>
                </div>
            </div>
            <CreatePost open={open} setOpen={setOpen} />
        </div>
    );
};

export default LeftSidebar;