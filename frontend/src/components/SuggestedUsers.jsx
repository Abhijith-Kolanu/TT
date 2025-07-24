import React from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner';

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
                <h1 className='font-semibold text-gray-600'>Suggested for you</h1>
                <span className='font-medium cursor-pointer'>See All</span>
            </div>
            {
                suggestedUsers.map((user) => (
                    <div key={user._id} className='flex items-center justify-between my-5'>
                        <div className='flex items-center gap-2'>
                            <Link to={`/profile/${user._id}`}>
                                <Avatar>
                                    <AvatarImage src={user?.profilePicture} alt="post_image" />
                                    <AvatarFallback>{user?.username?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                            </Link>
                            <div>
                                <h1 className='font-semibold text-sm'>
                                    <Link to={`/profile/${user._id}`}>{user?.username}</Link>
                                </h1>
                                <span className='text-gray-600 text-sm'>{user?.bio || 'Bio here...'}</span>
                            </div>
                        </div>
                        <span
                            className='text-[#3BADF8] text-xs font-bold cursor-pointer hover:text-[#3495d6]'
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
