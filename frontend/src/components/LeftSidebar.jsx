import { Heart, Home, LogOut, MessageCircle, PlusSquare, Search, TrendingUp } from 'lucide-react';
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
import io from 'socket.io-client'; // 2. Import socket.io-client

const LeftSidebar = () => {
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    
    // 3. STATE TO HOLD ALL NOTIFICATIONS
    const [notifications, setNotifications] = useState([]);

    // 4. ADD THE SOCKET.IO USEEFFECT HOOK
    useEffect(() => {
        if (user) {
            const socket = io("http://localhost:8000", {
                query: {
                    userId: user._id // Send this user's ID to the backend
                }
            });

            // Listen for the 'newNotification' event from the server
            socket.on('newNotification', (newNotification) => {
                setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
                toast.info(`${newNotification.sender.username} ${newNotification.type}d your post!`);
            });

            // Clean up the socket connection when the component unmounts
            return () => socket.close();
        }
    }, [user]); // Rerun this effect if the user logs in or out


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
    };

    const sidebarItems = [
        // ... (your existing sidebarItems array is perfect, no changes needed)
        { icon: <Home />, text: "Home" },
        { text: "Search" },
        { icon: <TrendingUp />, text: "Explore" },
        { icon: <MessageCircle />, text: "Messages" },
        { icon: <Heart />, text: "Notifications" },
        { icon: <PlusSquare />, text: "Create" },
        {
            icon: (
                <Avatar className='w-6 h-6'>
                    <AvatarImage src={user?.profilePicture} alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            ),
            text: "Profile"
        },
        { icon: <LogOut />, text: "Logout" },
    ];

    return (
        <div className='fixed top-0 z-10 left-0 px-4 border-r border-gray-300 w-[16%] h-screen'>
            <div className='flex flex-col'>
                <h1 className='my-8 pl-3 font-bold text-xl'>TrekTales</h1>
                <div>
                    {sidebarItems.map((item, index) => {
                        if (item.text === 'Search') {
                            // ... (search component logic is perfect, no changes needed)
                            return (
                                <div key={index} className='flex items-center gap-3 relative p-3 my-3'>
                                    <Search />
                                    <SearchComponent />
                                </div>
                            );
                        }

                        return (
                            <div onClick={() => sidebarHandler(item.text)} key={index} className='flex items-center gap-3 relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-3'>
                                {item.icon}
                                <span>{item.text}</span>
                                {item.text === "Notifications" && (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            {/* Show badge only if there are new notifications */}
                                            {notifications.length > 0 && (
                                                <Button size='icon' className="rounded-full h-5 w-5 bg-red-600 hover:bg-red-600 absolute bottom-6 left-6">{notifications.length}</Button>
                                            )}
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <div>
                                                {/* 5. MAP OVER THE NEW NOTIFICATIONS STATE */}
                                                {notifications.length === 0 ? (<p>No new notifications</p>) : (
                                                    notifications.map((notification) => (
                                                        <div key={notification._id} className='flex items-center gap-2 my-2'>
                                                            <Avatar>
                                                                <AvatarImage src={notification.sender?.profilePicture} />
                                                                <AvatarFallback>CN</AvatarFallback>
                                                            </Avatar>
                                                            <p className='text-sm'>
                                                                <span className='font-bold'>{notification.sender?.username}</span> {notification.type}d your post
                                                            </p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                )}
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