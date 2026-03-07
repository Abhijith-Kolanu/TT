import React, { useState } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner';
import { getUserInitials } from '@/lib/utils';
import { updateFollowing } from '@/redux/authSlice';

const SuggestedUsers = () => {
    const { suggestedUsers, user } = useSelector(store => store.auth);
    const dispatch = useDispatch();

    // hide users that are already followed (or get followed during this session)
    const [hiddenIds, setHiddenIds] = useState(() =>
        new Set(suggestedUsers.filter(su => su.followers?.includes(user?._id)).map(su => su._id))
    );

    const handleFollow = async (targetUserId) => {
        // optimistic: hide from list + increment following count
        setHiddenIds(prev => new Set([...prev, targetUserId]));
        dispatch(updateFollowing({ targetId: targetUserId, follow: true }));
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/v1/user/followorunfollow/${targetUserId}`,
                {},
                { withCredentials: true }
            );
            toast.success(res.data.message);
        } catch (error) {
            // revert on error
            setHiddenIds(prev => { const s = new Set(prev); s.delete(targetUserId); return s; });
            dispatch(updateFollowing({ targetId: targetUserId, follow: false }));
            const msg = error.response?.data?.message || 'Something went wrong!';
            toast.error(msg);
        }
    };

    const visibleUsers = suggestedUsers.filter(su => !hiddenIds.has(su._id)).slice(0, 5);

    return (
        <div className='space-y-1.5'>
            {visibleUsers.length > 0 ? (
                visibleUsers.map((su) => (
                        <div key={su._id} className='group flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors'>
                            <Link to={`/profile/${su._id}`} className='flex-shrink-0'>
                                <Avatar className='w-9 h-9 ring-1 ring-gray-200 dark:ring-gray-700 group-hover:ring-indigo-300 dark:group-hover:ring-indigo-600 transition-all'>
                                    <AvatarImage src={su?.profilePicture} alt="user" />
                                    <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-violet-500 text-white font-bold text-xs">
                                        {getUserInitials(su?.username)}
                                    </AvatarFallback>
                                </Avatar>
                            </Link>
                            <div className='min-w-0 flex-1'>
                                <Link to={`/profile/${su._id}`}>
                                    <p className='font-semibold text-[12px] text-gray-800 dark:text-gray-200 truncate hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors leading-tight'>
                                        {su?.username}
                                    </p>
                                </Link>
                                <p className='text-[10px] text-gray-400 dark:text-gray-500 truncate leading-tight mt-0.5'>
                                    {su?.bio || 'Traveler'}
                                </p>
                            </div>
                            <button
                                className='flex-shrink-0 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-white dark:hover:text-white hover:bg-indigo-500 dark:hover:bg-indigo-600 border border-indigo-200 dark:border-indigo-700 hover:border-transparent px-2.5 py-1 rounded-full transition-all duration-200 whitespace-nowrap'
                                onClick={() => handleFollow(su._id)}
                            >
                                Follow
                            </button>
                        </div>
                    ))
            ) : (
                <div className='text-center py-5'>
                    <p className='text-gray-400 dark:text-gray-500 text-xs'>No suggestions yet</p>
                </div>
            )}
        </div>
    );
};

export default SuggestedUsers;
