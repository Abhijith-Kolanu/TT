import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'sonner';
import { getUserInitials } from '@/lib/utils';

const LikesModal = ({ open, onClose, postId }) => {
    const [likes, setLikes] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (open && postId) {
            fetchLikes();
        }
    }, [open, postId]);

    const fetchLikes = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/post/${postId}/likes`, {
                withCredentials: true
            });
            
            if (response.data.success) {
                setLikes(response.data.likes);
            }
        } catch (error) {
            console.error('Error fetching likes:', error);
            toast.error('Failed to fetch likes');
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = (userId) => {
        navigate(`/profile/${userId}`);
        onClose(false);
    };

    const handleFollowToggle = async (userId, isFollowing) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/v1/user/followorunfollow/${userId}`,
                {},
                { withCredentials: true }
            );
            
            if (response.data.success) {
                // Update the likes list to reflect follow status change
                setLikes(likes.map(like => 
                    like._id === userId 
                        ? { ...like, isFollowing: !isFollowing }
                        : like
                ));
                toast.success(response.data.message);
            }
        } catch (error) {
            console.error('Error following/unfollowing user:', error);
            toast.error('Failed to update follow status');
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => onClose(isOpen)}>
            <DialogContent className="max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-white">Likes</DialogTitle>
                </DialogHeader>
                
                <div className="max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : likes.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">No likes yet</p>
                    ) : (
                        <div className="space-y-3">
                            {likes.map((like) => (
                                <div key={like._id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                    <div 
                                        className="flex items-center space-x-3 cursor-pointer flex-1"
                                        onClick={() => handleUserClick(like._id)}
                                    >
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={like.profilePicture} alt={like.username} />
                                            <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold">
                                                {getUserInitials(like.username)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{like.username}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{like.bio || 'No bio available'}</p>
                                        </div>
                                    </div>
                                    
                                    {user._id !== like._id && (
                                        <Button
                                            variant={like.isFollowing ? "outline" : "default"}
                                            size="sm"
                                            onClick={() => handleFollowToggle(like._id, like.isFollowing)}
                                            className={`ml-3 ${
                                                like.isFollowing 
                                                    ? 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700' 
                                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                            }`}
                                        >
                                            {like.isFollowing ? 'Unfollow' : 'Follow'}
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default LikesModal;
