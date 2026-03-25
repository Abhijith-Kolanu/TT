import { Heart, Home, LogOut, MessageCircle, PlusSquare, Search, Footprints, Plane, Mountain, Compass, BookOpen, Lock, Camera, Users, Map } from 'lucide-react';
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
import { resetChatState } from '@/redux/chatSlice';

const LeftSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector(store => store.auth);
    const { unreadMessages } = useSelector(store => store.chat);
    const { unreadCount: notificationUnreadCount, notifications } = useSelector(store => store.notification);
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [pendingGuideRequestsCount, setPendingGuideRequestsCount] = useState(0);
    
    // Fetch notifications
    useGetAllNotifications();
    
    // Calculate total unread count from unreadMessages object
    const unreadCount = unreadMessages ? Object.values(unreadMessages).reduce((total, count) => total + count, 0) : 0;

    useEffect(() => {
        if (!user?._id) {
            setPendingGuideRequestsCount(0);
            return;
        }

        let isMounted = true;

        const fetchPendingGuideRequests = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/booking`, { withCredentials: true });
                const pending = (res.data?.asGuide || []).filter(booking => {
                    return booking?.status === 'pending' && Boolean(booking?.traveller?._id || booking?.traveller);
                }).length;
                if (isMounted) {
                    setPendingGuideRequestsCount(pending);
                }
            } catch {
                if (isMounted) {
                    setPendingGuideRequestsCount(0);
                }
            }
        };

        fetchPendingGuideRequests();
    const intervalId = window.setInterval(fetchPendingGuideRequests, 10000);

        const handleGuideBookingsUpdated = () => fetchPendingGuideRequests();
        const handleWindowFocus = () => fetchPendingGuideRequests();

        window.addEventListener('guide-bookings-updated', handleGuideBookingsUpdated);
        window.addEventListener('focus', handleWindowFocus);

        return () => {
            isMounted = false;
            window.clearInterval(intervalId);
            window.removeEventListener('guide-bookings-updated', handleGuideBookingsUpdated);
            window.removeEventListener('focus', handleWindowFocus);
        };
    }, [user?._id]);

    // Function to determine if a navigation item is active
    const isActiveRoute = (itemText) => {
        const currentPath = location.pathname;
        
        switch (itemText) {
            case 'Explore':
                return currentPath === '/';
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
            case 'Guide Connect':
                return currentPath === '/guides';
            case 'Profile':
                return currentPath.startsWith('/profile');
            default:
                return false;
        }
    };

    const logoutHandler = async () => {
        // ... (your existing logoutHandler code is perfect, no changes needed)
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/user/logout`, { withCredentials: true });
            if (res.data.success) {
                dispatch(setAuthUser(null));
                dispatch(setSelectedPost(null));
                dispatch(setPosts([]));
                dispatch(resetChatState()); // Clear chat state on logout
                navigate("/login");
                toast.dismiss();
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
        else if (textType === "Explore") navigate("/");
        else if (textType === 'Messages') navigate("/chat");
        else if (textType === 'Private Journal') navigate("/journal");
        else if (textType == 'Notifications') navigate("/notifications")
        else if (textType == 'Footsteps') navigate("/footsteps")
    else if (textType == 'Trip Planner') navigate("/planner")
    else if (textType == 'Scrapbook') navigate("/scrapbook")
    else if (textType == 'Guide Connect') navigate("/guides")
    };

    const sidebarItems = [
        // ... (your existing sidebarItems array is perfect, no changes needed)
    { icon: <Map />, text: "Explore" },
    { text: "Search" },
    { icon: <Plane />, text: "Trip Planner" },
    { icon: <Compass />, text: "Guide Connect" },
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
        <div className='fixed top-0 z-20 left-0 w-64 h-screen bg-gradient-to-b from-blue-50 via-indigo-50/80 to-white dark:from-gray-900 dark:via-blue-950/60 dark:to-gray-900 lg:block hidden transition-all duration-300 border-r border-blue-100 dark:border-blue-900/40 overflow-hidden'>
            <style>{`
                @keyframes rainbow-top {
                    0%   { background-position: 0% 50%; }
                    50%  { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .rainbow-top-bar {
                    background: linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6, #06b6d4, #10b981, #f59e0b, #ef4444, #3b82f6);
                    background-size: 300% 100%;
                    animation: rainbow-top 6s linear infinite;
                }
            `}</style>

            {/* Rainbow accent line at very top */}
            <div className='rainbow-top-bar h-1 w-full absolute top-0 left-0 z-30'></div>

            {/* Decorative blurred orbs */}
            <div className='absolute top-24 right-3 w-20 h-20 bg-blue-400/15 rounded-full blur-2xl pointer-events-none'></div>
            <div className='absolute top-1/2 left-0 w-16 h-16 bg-indigo-400/10 rounded-full blur-xl pointer-events-none'></div>
            <div className='absolute bottom-24 right-4 w-14 h-14 bg-green-400/15 rounded-full blur-xl pointer-events-none'></div>

            <div className='flex flex-col h-full relative z-10 pt-1'>

                {/* ── Header ── */}
                <div className='flex-shrink-0 px-5 pt-5 pb-4'>
                    <div className='flex items-center justify-between mb-1'>
                        {/* Logo */}
                        <div className='flex items-center gap-3'>
                            <div className='relative'>
                                <div className='w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg rotate-6 hover:rotate-0 transition-all duration-500 group cursor-pointer'>
                                    <Mountain className='w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300' />
                                </div>
                                <div className='absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full opacity-80 blur-[2px]'></div>
                            </div>
                            <div>
                                <h1 className='text-xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-green-600 bg-clip-text text-transparent leading-tight'>TrekTales</h1>
                                <p className='text-[10px] text-gray-400 dark:text-gray-500 font-medium tracking-widest uppercase'>Your Travel Story</p>
                            </div>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>

                {/* Divider */}
                <div className='mx-5 h-px bg-gradient-to-r from-transparent via-blue-200 dark:via-blue-800 to-transparent mb-3'></div>

                {/* ── Navigation ── */}
                <div className='flex-1 overflow-y-auto px-3 sidebar-scroll'>
                    {sidebarItems.map((item, index) => {
                        if (item.text === 'Search') {
                            return (
                                <div key={index} className='mb-1 relative z-50'>
                                    <div className='px-3 py-2'>
                                        <SearchComponent />
                                    </div>
                                </div>
                            );
                        }

                        const isActive = isActiveRoute(item.text);
                        const isLogout = item.text === 'Logout';

                        return (
                            <div
                                onClick={() => sidebarHandler(item.text)}
                                key={index}
                                className={`group relative flex items-center gap-3 px-3 py-2.5 mb-0.5 rounded-xl cursor-pointer transition-all duration-200 select-none ${
                                    isActive
                                        ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/15 dark:to-indigo-500/15'
                                        : isLogout
                                        ? 'hover:bg-red-50 dark:hover:bg-red-900/20'
                                        : 'hover:bg-white/70 dark:hover:bg-white/5'
                                }`}
                            >
                                {/* Active left bar */}
                                {isActive && (
                                    <div className='absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-r-full'></div>
                                )}

                                {/* Icon */}
                                <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg transition-all duration-200 ${
                                    isActive
                                        ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-200 dark:shadow-blue-900'
                                        : isLogout
                                        ? 'text-red-400 group-hover:bg-red-100 dark:group-hover:bg-red-900/30'
                                        : 'text-gray-500 dark:text-gray-400 group-hover:bg-blue-100/60 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                                }`}>
                                    <span className='w-4 h-4 flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4 [&>svg]:flex-shrink-0'>{item.icon}</span>
                                </div>

                                {/* Label */}
                                <span className={`font-medium text-sm transition-colors duration-200 ${
                                    isActive
                                        ? 'text-blue-700 dark:text-blue-300 font-semibold'
                                        : isLogout
                                        ? 'text-red-400 group-hover:text-red-500'
                                        : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
                                }`}>
                                    {item.text}
                                </span>

                                {item.text === 'Messages' && unreadCount > 0 && (
                                    <span className='ml-auto flex-shrink-0 bg-blue-500 text-white text-[11px] font-bold rounded-full px-2 py-0.5 min-w-[22px] text-center leading-tight shadow-sm'>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}

                                {item.text === 'Guide Connect' && pendingGuideRequestsCount > 0 && (
                                    <span className='ml-auto flex-shrink-0 bg-blue-500 text-white text-[11px] font-bold rounded-full px-2 py-0.5 min-w-[22px] text-center leading-tight shadow-sm'>
                                        {pendingGuideRequestsCount > 99 ? '99+' : pendingGuideRequestsCount}
                                    </span>
                                )}

                                {/* Notification count pill next to label */}
                                {item.text === 'Notifications' && notificationUnreadCount > 0 && (
                                    <span className='ml-auto flex-shrink-0 bg-red-500 text-white text-[11px] font-bold rounded-full px-2 py-0.5 min-w-[22px] text-center leading-tight shadow-sm'>
                                        {notificationUnreadCount > 99 ? '99+' : notificationUnreadCount}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* ── Bottom divider ── */}
                <div className='mx-5 h-px bg-gradient-to-r from-transparent via-blue-200 dark:via-blue-800 to-transparent mt-2'></div>

                {/* ── Footer tagline ── */}
                <div className='flex-shrink-0 px-4 py-3'>
                    <div className='flex items-center justify-between gap-1'>
                        {[[Plane, 'Plan'], [Compass, 'Explore'], [Camera, 'Share'], [Users, 'Connect']].map(([Icon, label], i) => (
                            <React.Fragment key={label}>
                                <div className='flex flex-col items-center gap-0.5'>
                                    <Icon size={13} className='text-gray-400 dark:text-gray-500' />
                                    <span className='text-[8px] font-bold tracking-wider uppercase text-gray-400 dark:text-gray-500'>{label}</span>
                                </div>
                                {i < 3 && <div className='w-px h-6 bg-gray-200 dark:bg-gray-700'></div>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            <CreatePost open={open} setOpen={setOpen} />
        </div>
    );
};

export default LeftSidebar;