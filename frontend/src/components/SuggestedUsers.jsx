import React from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner';
import { getUserInitials } from '@/lib/utils';

const SuggestedUsers = () => {
    const { suggestedUsers } = useSelector(store => store.auth);

    const handleFollow = async (targetUserId) => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/v1/user/followorunfollow/${targetUserId}`,
                {}, // no body, just send the request
                { withCredentials: true } // send cookie with token
            );
            console.log(res.data);
            toast.success(res.data.message);
        } catch (error) {
            const msg = error.response?.data?.message || 'Something went wrong!';
            toast.error(msg); // ✅ Show error toast
            console.error('Follow error:', msg);
        }
    };

    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between'>
                <h3 className='font-semibold text-gray-700 dark:text-gray-300 text-sm'>Discover Travelers</h3>
                <span className='font-medium cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs transition-colors'>View All</span>
            </div>
            {suggestedUsers.length > 0 ? (
                <div className='space-y-3'>
                    {
                        suggestedUsers.slice(0, 4).map((user) => (
                            <div key={user._id} className='flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200'>
                                <Link to={`/profile/${user._id}`} className='flex-shrink-0'>
                                    <Avatar className='w-10 h-10 ring-2 ring-gray-200 dark:ring-gray-600 hover:ring-blue-300 dark:hover:ring-blue-500 transition-all'>
                                        <AvatarImage src={user?.profilePicture} alt="post_image" />
                                        <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm">
                                            {getUserInitials(user?.username)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Link>
                                <div className='min-w-0 flex-1'>
                                    <h4 className='font-semibold text-sm truncate'>
                                        <Link to={`/profile/${user._id}`} className='text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors'>{user?.username}</Link>
                                    </h4>
                                    <p className='text-gray-500 dark:text-gray-400 text-xs truncate'>{user?.bio || 'New traveler'}</p>
                                </div>
                                <button
                                    className='flex-shrink-0 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-semibold rounded-full transition-all duration-200 hover:scale-105 whitespace-nowrap'
                                    onClick={() => handleFollow(user._id)}
                                >
                                    Follow
                                </button>
                            </div>
                        ))
                    }
                </div>
            ) : (
                <div className='text-center py-6'>
                    <p className='text-gray-500 dark:text-gray-400 text-sm'>No suggested users yet</p>
                </div>
            )}
        </div>
    );
};

export default SuggestedUsers;
