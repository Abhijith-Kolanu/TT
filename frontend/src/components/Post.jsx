import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react'
import { Button } from './ui/button'
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark } from "react-icons/fa";
import CommentDialog from './CommentDialog'
import ShareDialog from './ShareDialog'
import LikesModal from './LikesModal'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import axios from 'axios'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { useNavigate } from 'react-router-dom'

const Post = ({ post }) => {
    const [text, setText] = useState("");
    const [open, setOpen] = useState(false);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [likesModalOpen, setLikesModalOpen] = useState(false);
    const { user } = useSelector(store => store.auth);
    const { posts } = useSelector(store => store.post);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Debug API URL
    console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);

    const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
    const [postLike, setPostLike] = useState(post.likes.length);
    const [comment, setComment] = useState(post.comments);
    const [bookmarked, setBookmarked] = useState(user?.bookmarks?.includes(post._id) || false);

    // Helper function to get user initials
    const getUserInitials = (username) => {
        if (!username) return '?';
        return username.slice(0, 2).toUpperCase();
    };

    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        if (inputText.trim()) {
            setText(inputText);
        } else {
            setText("");
        }
    }

    const likeOrDislikeHandler = async () => {
        try {
            console.log('Like/Dislike handler called', { postId: post._id, liked, user: user?._id });
            const action = liked ? 'dislike' : 'like';
            const url = `${import.meta.env.VITE_API_URL}/api/v1/post/${post._id}/${action}`;
            console.log('Making request to:', url);
            
            const res = await axios.get(url, { withCredentials: true });
            console.log('Response:', res.data);
            
            if (res.data.success) {
                const updatedLikes = liked ? postLike - 1 : postLike + 1;
                setPostLike(updatedLikes);
                setLiked(!liked);
                
                // Update the post in the posts array
                const updatedPostData = posts.map(p =>
                    p._id === post._id ? {
                        ...p,
                        likes: liked
                            ? p.likes.filter(id => id !== user._id)
                            : [...p.likes, user._id]
                    } : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log('Like error:', error);
            console.log('Error response:', error.response?.data);
            toast.error(error.response?.data?.message || 'Like failed');
        }
    }

    const commentHandler = async () => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/post/${post._id}/comment`, { text }, { withCredentials: true });
            if (res.data.success) {
                const updatedCommentData = [...comment, res.data.comment];
                setComment(updatedCommentData);

                const updatedPostData = posts.map(p =>
                    p._id === post._id ? { ...p, comments: updatedCommentData } : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
                setText("");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const deletePostHandler = async () => {
        try {
            const res = await axios.delete(`${import.meta.env.VITE_API_URL}/api/v1/post/delete/${post?._id}`, { withCredentials: true });
            if (res.data.success) {
                const updatedPostData = posts.filter((postItem) => postItem?._id !== post?._id);
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    }

    const bookmarkHandler = async () => {
        try {
            console.log('Bookmark handler called', { postId: post._id, bookmarked, user: user?._id });
            const url = `${import.meta.env.VITE_API_URL}/api/v1/post/${post?._id}/bookmark`;
            console.log('Making bookmark request to:', url);
            
            const res = await axios.get(url, { withCredentials: true });
            console.log('Bookmark response:', res.data);
            
            if (res.data.success) {
                setBookmarked(!bookmarked);
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log('Bookmark error:', error);
            console.log('Error response:', error.response?.data);
            toast.error(error.response?.data?.message || 'Bookmark failed');
        }
    }

    const shareHandler = () => {
        setShareDialogOpen(true);
    }

    const handleProfileClick = () => {
        navigate(`/profile/${post?.author?._id}`);
    }

    return (
        <div className='relative w-full max-w-lg mx-auto mb-8 group'>
            {/* Animated background with travel theme */}
            <div className='absolute inset-0 bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-3xl transform rotate-1 group-hover:rotate-0 transition-transform duration-500'></div>
            <div className='absolute inset-0 bg-gradient-to-tl from-orange-100 via-white to-cyan-100 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-3xl transform -rotate-1 group-hover:rotate-0 transition-transform duration-700'></div>
            
            {/* Main card */}
            <div className='relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200/50 dark:border-gray-600/30 backdrop-blur-sm'>
                
                {/* Decorative travel elements */}
                <div className='absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20 animate-pulse'></div>
                <div className='absolute top-8 right-12 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-30 animate-bounce' style={{animationDelay: '0.5s'}}></div>
                <div className='absolute top-12 right-8 w-3 h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-25 animate-ping' style={{animationDelay: '1s'}}></div>

                {/* Header with Travel Theme */}
                <div className='relative z-10 p-6 pb-4'>
                    <div className='flex items-center gap-4'>
                        <div className='relative'>
                            <Avatar className="cursor-pointer w-16 h-16 ring-4 ring-white dark:ring-gray-700 shadow-xl duration-300" onClick={handleProfileClick}>
                                <AvatarImage src={post.author?.profilePicture} alt="traveler_image" />
                                <AvatarFallback className="bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 text-white font-bold text-xl">
                                    {getUserInitials(post.author?.username)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className='flex-1'>
                            <div className='flex items-center gap-2 mb-1'>
                                <h1 
                                    className='text-gray-900 dark:text-white font-bold text-lg cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
                                    onClick={handleProfileClick}
                                >
                                    {post.author?.username}
                                </h1>
                            </div>
                            <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                                <span>
                                    {(() => {
                                        if (!post.createdAt || isNaN(new Date(post.createdAt))) {
                                            return 'Recently posted';
                                        }
                                        
                                        const date = new Date(post.createdAt);
                                        const now = new Date();
                                        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
                                        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
                                        
                                        if (diffInMinutes < 1) return 'Now';
                                        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
                                        if (diffInHours < 1) return 'Less than 1h ago';
                                        if (diffInHours < 24) return `${diffInHours}h ago`;
                                        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
                                        return date.toLocaleDateString();
                                    })()}
                                </span>
                            </div>
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <div className='w-10 h-10 bg-white/70 dark:bg-gray-700/70 hover:bg-white dark:hover:bg-gray-600 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 backdrop-blur-sm shadow-lg'>
                                    <MoreHorizontal className='w-5 h-5 text-gray-600 dark:text-gray-400' />
                                </div>
                            </DialogTrigger>
                            <DialogContent className="adventure-card flex flex-col items-center text-sm text-center border-blue-200/30 dark:border-blue-700/30 max-w-sm">
                                <div className='w-full space-y-2'>
                                    {post?.author?._id !== user?._id && (
                                        <Button variant='ghost' className="w-full justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium rounded-xl">
                                            Unfollow
                                        </Button>
                                    )}
                                    <Button variant='ghost' className="w-full justify-center text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl">
                                        Add to favorites
                                    </Button>
                                    {user && user?._id === post?.author._id && (
                                        <Button onClick={deletePostHandler} variant='ghost' className="w-full justify-center text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl">
                                            Delete
                                        </Button>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Image */}
                <div className='relative z-10 mx-4 mb-4 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300'>
                    <img
                        className='w-full aspect-square object-cover transition-all duration-700'
                        src={post.image}
                        alt="post_img"
                    />
                    {/* Overlay gradient */}
                    <div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                </div>

                {/* Content */}
                <div className='relative z-10 px-6 pb-6'>
                    {/* Action buttons */}
                    <div className='flex items-center justify-between mb-4'>
                        <div className='flex items-center gap-6'>
                            <div className={`relative p-3 rounded-2xl transition-colors duration-200 ${
                                liked 
                                    ? 'bg-red-50 dark:bg-red-900/20' 
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                            }`}>
                                {liked ? (
                                    <FaHeart 
                                        onClick={likeOrDislikeHandler} 
                                        size={22} 
                                        className='cursor-pointer text-red-500' 
                                    />
                                ) : (
                                    <FaRegHeart 
                                        onClick={likeOrDislikeHandler} 
                                        size={22} 
                                        className='cursor-pointer text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors' 
                                    />
                                )}
                            </div>

                            <div className='p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200'>
                                <MessageCircle 
                                    onClick={() => {
                                        dispatch(setSelectedPost(post));
                                        setOpen(true);
                                    }} 
                                    size={22}
                                    className='cursor-pointer text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors' 
                                />
                            </div>

                            <div className='p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200'>
                                <Send 
                                    onClick={shareHandler} 
                                    size={22}
                                    className='cursor-pointer text-gray-600 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors' 
                                />
                            </div>
                        </div>
                        
                        <div className={`p-3 rounded-2xl transition-colors duration-200 ${
                            bookmarked 
                                ? 'bg-yellow-50 dark:bg-yellow-900/20' 
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                        }`}>
                            {bookmarked ? (
                                <FaBookmark 
                                    onClick={bookmarkHandler} 
                                    size={20} 
                                    className='cursor-pointer text-yellow-600 dark:text-yellow-500' 
                                />
                            ) : (
                                <FaRegBookmark 
                                    onClick={bookmarkHandler} 
                                    size={20} 
                                    className='cursor-pointer text-gray-600 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors' 
                                />
                            )}
                        </div>
                    </div>

                    {/* Likes */}
                    <div className='mb-4 flex items-center gap-4'>
                        <span 
                            className='font-bold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-2'
                            onClick={() => postLike > 0 && setLikesModalOpen(true)}
                        >
                            {postLike} {postLike === 1 ? 'like' : 'likes'}
                        </span>
                    </div>

                    {/* Caption */}
                    <div className='mb-3'>
                        <p className='text-gray-800 dark:text-gray-200 leading-relaxed'>
                            <span 
                                className='font-bold mr-2 text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
                                onClick={handleProfileClick}
                            >
                                {post.author?.username}
                            </span>
                            {post.caption}
                        </p>
                    </div>

                    {/* Comments */}
                    {comment.length > 0 && (
                        <div className='mb-4'>
                            <span 
                                onClick={() => {
                                    dispatch(setSelectedPost(post));
                                    setOpen(true);
                                }} 
                                className='cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors inline-flex items-center gap-2'
                            >
                                <MessageCircle size={14} />
                                {comment.length === 1 ? `View 1 comment` : `View ${comment.length} comments`}
                            </span>
                        </div>
                    )}

                    {/* Comment input */}
                    <div className='flex items-center gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50'>
                        <input
                            type="text"
                            placeholder='Add a comment...'
                            value={text}
                            onChange={changeEventHandler}
                            className='flex-1 outline-none text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 py-2'
                        />
                        {text && (
                            <button 
                                onClick={commentHandler} 
                                className='text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors'
                            >
                                Post
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CommentDialog open={open} setOpen={setOpen} />
            <ShareDialog 
                open={shareDialogOpen} 
                setOpen={setShareDialogOpen}
                post={post}
            />
            <LikesModal 
                open={likesModalOpen}
                onClose={setLikesModalOpen}
                postId={post._id}
            />
        </div>
    )
}

export default Post
