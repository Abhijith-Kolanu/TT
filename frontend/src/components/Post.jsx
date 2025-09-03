import React, { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react'
import { Button } from './ui/button'
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark } from 'react-icons/fa'
import CommentDialog from './CommentDialog'
import ShareDialog from './ShareDialog'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { updateUserBookmarks } from '@/redux/authSlice'
import { Badge } from './ui/badge'
import { getUserInitials } from '@/lib/utils'

const Post = ({ post }) => {
    const [text, setText] = useState("");
    const [open, setOpen] = useState(false);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const { user } = useSelector(store => store.auth);
    const { posts } = useSelector(store => store.post);
    const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
    const [postLike, setPostLike] = useState(post.likes.length);
    const [comment, setComment] = useState(post.comments);
    const [bookmarked, setBookmarked] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Update bookmark state when user or post changes
    useEffect(() => {
        if (user?.bookmarks && post?._id) {
            const isBookmarked = user.bookmarks.includes(post._id);
            setBookmarked(isBookmarked);
        }
    }, [user?.bookmarks, post?._id]);

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
            const action = liked ? 'dislike' : 'like';
            const res = await axios.get(`http://localhost:8000/api/v1/post/${post._id}/${action}`, { withCredentials: true });
            console.log(res.data);
            if (res.data.success) {
                const updatedLikes = liked ? postLike - 1 : postLike + 1;
                setPostLike(updatedLikes);
                setLiked(!liked);

                // apne post ko update krunga
                const updatedPostData = posts.map(p =>
                    p._id === post._id ? {
                        ...p,
                        likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
                    } : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const commentHandler = async () => {

        try {
            const res = await axios.post(`http://localhost:8000/api/v1/post/${post._id}/comment`, { text }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            console.log(res.data);
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
            const res = await axios.delete(`http://localhost:8000/api/v1/post/delete/${post?._id}`, { withCredentials: true })
            if (res.data.success) {
                const updatedPostData = posts.filter((postItem) => postItem?._id !== post?._id);
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.messsage);
        }
    }

    const bookmarkHandler = async () => {
        try {
            const res = await axios.get(`http://localhost:8000/api/v1/post/${post?._id}/bookmark`, {withCredentials:true});
            if(res.data.success){
                const isBookmarked = res.data.type === 'saved';
                setBookmarked(isBookmarked);
                
                // Update user's bookmarks in Redux
                let updatedBookmarks;
                if (isBookmarked) {
                    // Add to bookmarks
                    updatedBookmarks = [...(user.bookmarks || []), post._id];
                } else {
                    // Remove from bookmarks
                    updatedBookmarks = (user.bookmarks || []).filter(id => id !== post._id);
                }
                    
                dispatch(updateUserBookmarks(updatedBookmarks));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to update bookmark");
        }
    }
    const shareHandler = () => {
        setShareDialogOpen(true);
    }

    const handleProfileClick = () => {
        navigate(`/profile/${post.author._id}`);
    }

    return (
        <div className='my-8 w-full max-w-md mx-auto bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm'>
            <div className='flex items-center justify-between p-4'>
                <div className='flex items-center gap-2'>
                    <Avatar className="cursor-pointer" onClick={handleProfileClick}>
                        <AvatarImage src={post.author?.profilePicture} alt="post_image" />
                        <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold">
                            {getUserInitials(post.author?.username)}
                        </AvatarFallback>
                    </Avatar>
                    <div className='flex items-center gap-3'>
                        <h1 
                            className='text-gray-900 dark:text-white font-semibold cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
                            onClick={handleProfileClick}
                        >
                            {post.author?.username}
                        </h1>
                       {user?._id === post.author._id &&  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Author</Badge>}
                    </div>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <MoreHorizontal className='cursor-pointer text-gray-600 dark:text-gray-400' />
                    </DialogTrigger>
                    <DialogContent className="flex flex-col items-center text-sm text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        {
                        post?.author?._id !== user?._id && <Button variant='ghost' className="cursor-pointer w-fit text-[#ED4956] font-bold hover:bg-gray-100 dark:hover:bg-gray-700">Unfollow</Button>
                        }
                        
                        <Button variant='ghost' className="cursor-pointer w-fit text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Add to favorites</Button>
                        {
                            user && user?._id === post?.author._id && <Button onClick={deletePostHandler} variant='ghost' className="cursor-pointer w-fit text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Delete</Button>
                        }
                    </DialogContent>
                </Dialog>
            </div>
            <img
                className='w-full aspect-square object-cover'
                src={post.image}
                alt="post_img"
            />

            <div className='p-4'>
                <div className='flex items-center justify-between my-2'>
                    <div className='flex items-center gap-3'>
                        {
                            liked ? <FaHeart onClick={likeOrDislikeHandler} size={'24'} className='cursor-pointer text-red-600' /> : <FaRegHeart onClick={likeOrDislikeHandler} size={'22px'} className='cursor-pointer hover:text-gray-600 dark:hover:text-gray-400 text-gray-700 dark:text-gray-300' />
                        }

                        <MessageCircle onClick={() => {
                            dispatch(setSelectedPost(post));
                            setOpen(true);
                        }} className='cursor-pointer hover:text-gray-600 dark:hover:text-gray-400 text-gray-700 dark:text-gray-300' />
                        <Send onClick={shareHandler} className='cursor-pointer hover:text-gray-600 dark:hover:text-gray-400 text-gray-700 dark:text-gray-300' />
                    </div>
                    {
                        bookmarked ? <FaBookmark onClick={bookmarkHandler} size={'20px'} className='cursor-pointer text-gray-900 dark:text-white' /> : <FaRegBookmark onClick={bookmarkHandler} size={'20px'} className='cursor-pointer hover:text-gray-600 dark:hover:text-gray-400 text-gray-700 dark:text-gray-300' />
                    }
                </div>
                <span className='font-medium block mb-2 text-gray-900 dark:text-white'>{postLike} likes</span>
                <p className='text-gray-800 dark:text-gray-200'>
                    <span 
                        className='font-medium mr-2 text-gray-900 dark:text-white cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
                        onClick={handleProfileClick}
                    >
                        {post.author?.username}
                    </span>
                    {post.caption}
                </p>
                {
                    comment.length > 0 && (
                        <span onClick={() => {
                            dispatch(setSelectedPost(post));
                            setOpen(true);
                        }} className='cursor-pointer text-sm text-gray-400 dark:text-gray-500'>
                            {comment.length === 1 ? `View 1 comment` : `View all ${comment.length} comments`}
                        </span>
                    )
                }
                <CommentDialog open={open} setOpen={setOpen} />
                <ShareDialog 
                    open={shareDialogOpen} 
                    setOpen={setShareDialogOpen}
                    post={post}
                />
                <div className='flex items-center justify-between mt-3 pt-3 border-t dark:border-gray-700'>
                    <input
                        type="text"
                        placeholder='Add a comment...'
                        value={text}
                        onChange={changeEventHandler}
                        className='outline-none text-sm w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
                    />
                    {
                        text && <span onClick={commentHandler} className='text-[#3BADF8] cursor-pointer'>Post</span>
                    }
                </div>
            </div>
        </div>
    )
}

export default Post