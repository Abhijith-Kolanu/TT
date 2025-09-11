import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { ArrowLeft, Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import { getUserInitials } from '@/lib/utils';
import Post from './Post';

const PostDetail = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useSelector(store => store.auth);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/post/${postId}`, {
                    withCredentials: true
                });
                
                if (response.data.success) {
                    setPost(response.data.post);
                } else {
                    toast.error('Post not found');
                    navigate('/');
                }
            } catch (error) {
                console.error('Error fetching post:', error);
                toast.error('Failed to load post');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            fetchPost();
        }
    }, [postId, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Post not found</h1>
                <Button onClick={() => navigate('/')} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go back home
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header with back button */}
                <div className="flex items-center mb-6">
                    <Button 
                        onClick={() => navigate(-1)} 
                        variant="ghost" 
                        size="sm"
                        className="mr-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {post.author?.username}'s Post
                    </h1>
                </div>

                {/* Post component */}
                <Post post={post} />
            </div>
        </div>
    );
};

export default PostDetail;
