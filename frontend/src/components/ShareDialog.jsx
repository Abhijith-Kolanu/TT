import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, Send, Copy, MessageSquare } from 'lucide-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'sonner';
import { getUserInitials } from '@/lib/utils';

const ShareDialog = ({ open, setOpen, post }) => {
    const { user } = useSelector(store => store.auth);
    const [searchQuery, setSearchQuery] = useState('');
    const [followers, setFollowers] = useState([]);
    const [frequentUsers, setFrequentUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchSuggestedUsers();
        }
    }, [open]);

    useEffect(() => {
        // Filter users based on search query
        const allUsers = [...followers, ...frequentUsers];
        const unique = allUsers.filter((user, index, self) => 
            index === self.findIndex(u => u._id === user._id)
        );
        
        if (searchQuery.trim()) {
            const filtered = unique.filter(user => 
                user.username.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(unique.slice(0, 8)); // Show top 8 users
        }
    }, [searchQuery, followers, frequentUsers]);

    const fetchSuggestedUsers = async () => {
        try {
            setLoading(true);
            // Get followers/following users
            const suggestedRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/user/suggested`, {
                withCredentials: true
            });
            
            if (suggestedRes.data.success) {
                setFollowers(suggestedRes.data.users || []);
            }

            // You can also implement frequent users from chat history
            // For now, we'll use suggested users as frequent users too
            setFrequentUsers(suggestedRes.data.users?.slice(0, 4) || []);
        } catch (error) {
            console.log('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleUserSelection = (selectedUser) => {
        setSelectedUsers(prev => {
            const isSelected = prev.find(u => u._id === selectedUser._id);
            if (isSelected) {
                return prev.filter(u => u._id !== selectedUser._id);
            } else {
                return [...prev, selectedUser];
            }
        });
    };

    const shareToUsers = async () => {
        if (selectedUsers.length === 0) {
            toast.error('Please select at least one user to share with');
            return;
        }

        try {
            setLoading(true);
            
            // Send post to each selected user
            const sharePromises = selectedUsers.map(async (selectedUser) => {
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/v1/message/send/${selectedUser._id}`,
                    {
                        messageType: 'post',
                        postId: post._id,
                        textMessage: `Shared a post by ${post.author?.username}`
                    },
                    { withCredentials: true }
                );
                return response.data;
            });

            const results = await Promise.all(sharePromises);
            
            // Check if all shares were successful
            const successfulShares = results.filter(result => result.success);
            
            if (successfulShares.length === selectedUsers.length) {
                toast.success(`Post shared with ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}!`);
            } else if (successfulShares.length > 0) {
                toast.success(`Post shared with ${successfulShares.length} out of ${selectedUsers.length} users`);
            } else {
                toast.error('Failed to share post with any users');
            }
            
            setSelectedUsers([]);
            setOpen(false);
        } catch (error) {
            console.log('Error sharing post:', error);
            toast.error('Failed to share post');
        } finally {
            setLoading(false);
        }
    };

    const copyLink = async () => {
        try {
            const postUrl = `${window.location.origin}/post/${post._id}`;
            
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(postUrl);
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = postUrl;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
            
            toast.success('Post link copied to clipboard!');
        } catch (error) {
            toast.error('Failed to copy link');
        }
    };

    const shareExternal = async (platform) => {
        const postUrl = `${window.location.origin}/post/${post._id}`;
        const shareText = `Check out this post by ${post.author?.username}: ${post.caption || ''}`;
        
        let shareUrl = '';
        
        switch (platform) {
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + postUrl)}`;
                break;
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(shareText)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
                break;
            case 'email':
                shareUrl = `mailto:?subject=${encodeURIComponent(`Check out this post`)}&body=${encodeURIComponent(shareText + '\n\n' + postUrl)}`;
                break;
            default:
                return;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    };

    const nativeShare = async () => {
        try {
            const shareData = {
                title: `${post.author?.username}'s post`,
                text: post.caption || 'Check out this post!',
                url: `${window.location.origin}/post/${post._id}`,
            };

            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
                toast.success('Post shared successfully!');
            } else {
                // Fallback to copy link
                await copyLink();
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.log('Share error:', error);
                toast.error('Failed to share post');
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md mx-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <DialogHeader>
                    <DialogTitle className="text-center text-gray-900 dark:text-white">Share Post</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                        />
                    </div>

                    {/* Internal Users Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Share with friends
                        </h3>
                        
                        {loading ? (
                            <div className="text-center py-4 text-gray-500">Loading users...</div>
                        ) : (
                            <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto">
                                {filteredUsers.map((suggestedUser) => (
                                    <div
                                        key={suggestedUser._id}
                                        onClick={() => toggleUserSelection(suggestedUser)}
                                        className={`flex flex-col items-center p-2 rounded-lg cursor-pointer transition-all ${
                                            selectedUsers.find(u => u._id === suggestedUser._id)
                                                ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent'
                                        }`}
                                    >
                                        <Avatar className="w-12 h-12 mb-1">
                                            <AvatarImage src={suggestedUser.profilePicture} />
                                            <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                                {getUserInitials(suggestedUser.username)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs text-center text-gray-700 dark:text-gray-300 truncate w-full">
                                            {suggestedUser.username}
                                        </span>
                                        {selectedUsers.find(u => u._id === suggestedUser._id) && (
                                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center mt-1">
                                                <span className="text-white text-xs">✓</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {selectedUsers.length > 0 && (
                            <Button
                                onClick={shareToUsers}
                                disabled={loading}
                                className="w-full mt-3 bg-blue-500 hover:bg-blue-600 text-white"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                Send to {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''}
                            </Button>
                        )}
                    </div>

                    {/* External Sharing Options */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Share to other apps
                        </h3>
                        
                        <div className="grid grid-cols-3 gap-3">
                            {/* Copy Link */}
                            <button
                                onClick={copyLink}
                                className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mb-2">
                                    <Copy className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                                </div>
                                <span className="text-xs text-gray-700 dark:text-gray-300">Copy Link</span>
                            </button>

                            {/* WhatsApp */}
                            <button
                                onClick={() => shareExternal('whatsapp')}
                                className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2">
                                    <MessageSquare className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs text-gray-700 dark:text-gray-300">WhatsApp</span>
                            </button>

                            {/* Native Share */}
                            <button
                                onClick={nativeShare}
                                className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                                    <Send className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs text-gray-700 dark:text-gray-300">More</span>
                            </button>

                            {/* Telegram */}
                            <button
                                onClick={() => shareExternal('telegram')}
                                className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center mb-2">
                                    <Send className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs text-gray-700 dark:text-gray-300">Telegram</span>
                            </button>

                            {/* Email */}
                            <button
                                onClick={() => shareExternal('email')}
                                className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mb-2">
                                    <span className="text-white text-sm font-bold">@</span>
                                </div>
                                <span className="text-xs text-gray-700 dark:text-gray-300">Email</span>
                            </button>

                            {/* Twitter */}
                            <button
                                onClick={() => shareExternal('twitter')}
                                className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-2">
                                    <span className="text-white text-sm font-bold">X</span>
                                </div>
                                <span className="text-xs text-gray-700 dark:text-gray-300">Twitter</span>
                            </button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ShareDialog;
