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
                `http://localhost:8000/api/v1/user/followorunfollow/${targetUserId}`,
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
        <div className='my-10'>
            <div className='flex items-center justify-between text-sm'>
                <h1 className='font-semibold text-gray-600 dark:text-gray-400'>Suggested for you</h1>
                <span className='font-medium cursor-pointer text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300'>See All</span>
            </div>
            {
                suggestedUsers.map((user) => (
                    <div key={user._id} className='flex items-center justify-between my-5'>
                        <div className='flex items-center gap-2'>
                            <Link to={`/profile/${user._id}`}>
                                <Avatar>
                                    <AvatarImage src={user?.profilePicture} alt="post_image" />
                                    <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold">
                                        {getUserInitials(user?.username)}
                                    </AvatarFallback>
                                </Avatar>
                            </Link>
                            <div>
                                <h1 className='font-semibold text-sm'>
                                    <Link to={`/profile/${user._id}`} className='text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300'>{user?.username}</Link>
                                </h1>
                                <span className='text-gray-600 dark:text-gray-400 text-sm'>{user?.bio || 'Bio here...'}</span>
                            </div>
                        </div>
                        <span
                            className='text-[#3BADF8] text-xs font-bold cursor-pointer hover:text-[#3495d6] dark:text-[#60A5FA] dark:hover:text-[#3B82F6]'
                            onClick={() => handleFollow(user._id)}
                        >
                            Follow
                        </span>
                    </div>
                ))
            }
        </div>
    );
};

export default SuggestedUsers;
