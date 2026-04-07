import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { getUserInitials } from '@/lib/utils';

const FollowersFollowingModal = ({ open, setOpen, userId, activeTab = 'followers' }) => {
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentTab, setCurrentTab] = useState(activeTab);
    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const isOwnProfile = String(userId) === String(user?._id);

    useEffect(() => {
        if (open && userId) {
            fetchFollowersFollowing();
        }
    }, [open, userId]);

    useEffect(() => {
        setCurrentTab(activeTab);
    }, [activeTab]);

    const fetchFollowersFollowing = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/v1/user/${userId}/followers-following`,
                { withCredentials: true }
            );
            
            if (response.data.success) {
                setFollowers(response.data.followers || []);
                setFollowing(response.data.following || []);
            }
        } catch (error) {
            console.error('Error fetching followers/following:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async (targetUserId) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/v1/user/followorunfollow/${targetUserId}`,
                {},
                { withCredentials: true }
            );
            
            if (response.data.success) {
                toast.success(response.data.message);
                // Refresh the data
                fetchFollowersFollowing();
            }
        } catch (error) {
            console.error('Error following/unfollowing user:', error);
            toast.error('Failed to update follow status');
        }
    };

    const handleUserClick = (clickedUserId) => {
        setOpen(false);
        navigate(`/profile/${clickedUserId}`);
    };

    const handleRemoveFollower = async (targetUserId) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/v1/user/remove-follower/${targetUserId}`,
                {},
                { withCredentials: true }
            );

            if (response.data.success) {
                toast.success(response.data.message || 'Follower removed');
                setFollowers((prev) => prev.filter((follower) => follower._id !== targetUserId));
            }
        } catch (error) {
            console.error('Error removing follower:', error);
            toast.error(error.response?.data?.message || 'Failed to remove follower');
        }
    };

    const isFollowing = (targetUserId) => {
        // Check if current user is following the target user
        return following.some(followedUser => followedUser._id === targetUserId);
    };

    const UserItem = ({ userData, showFollowButton = true, showRemoveFollowerButton = false, followBackMode = false }) => (
        <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleUserClick(userData._id)}>
                <Avatar className="h-12 w-12">
                    <AvatarImage src={userData.profilePicture} alt={userData.username} />
                    <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold">
                        {getUserInitials(userData.username)}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{userData.username}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{userData.bio || 'No bio available'}</p>
                </div>
            </div>
            <div className="ml-2 flex items-center gap-2">
            {showFollowButton && userData._id !== user?._id && (
                <Button
                    variant={isFollowing(userData._id) ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleFollow(userData._id)}
                    className="min-w-[76px]"
                >
                    {isFollowing(userData._id)
                        ? 'Unfollow'
                        : (followBackMode ? 'Follow Back' : 'Follow')}
                </Button>
            )}
            {showRemoveFollowerButton && userData._id !== user?._id && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveFollower(userData._id)}
                    className="min-w-[76px] border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                    Remove
                </Button>
            )}
            </div>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md mx-auto bg-white dark:bg-gray-800">
                <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-white">
                        Followers & Following
                    </DialogTitle>
                </DialogHeader>
                
                {/* Custom Tab Navigation */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                            currentTab === 'followers'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                        onClick={() => setCurrentTab('followers')}
                    >
                        Followers ({followers.length})
                    </button>
                    <button
                        className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                            currentTab === 'following'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                        onClick={() => setCurrentTab('following')}
                    >
                        Following ({following.length})
                    </button>
                </div>
                
                {/* Tab Content */}
                <div className="mt-4 max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : currentTab === 'followers' ? (
                        followers.length > 0 ? (
                            <div className="space-y-1">
                                {followers.map((follower) => (
                                    <UserItem
                                        key={follower._id}
                                        userData={follower}
                                        showFollowButton={isOwnProfile}
                                        showRemoveFollowerButton={isOwnProfile}
                                        followBackMode={isOwnProfile}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No followers yet
                            </div>
                        )
                    ) : (
                        following.length > 0 ? (
                            <div className="space-y-1">
                                {following.map((followedUser) => (
                                    <UserItem key={followedUser._id} userData={followedUser} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                Not following anyone yet
                            </div>
                        )
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default FollowersFollowingModal;
