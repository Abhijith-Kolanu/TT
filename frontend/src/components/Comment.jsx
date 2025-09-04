import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { getUserInitials } from '@/lib/utils'
import { useSelector } from 'react-redux'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'

const Comment = ({ comment, onDeleteComment }) => {
    const { user } = useSelector(store => store.auth);
    
    const handleDeleteComment = async () => {
        try {
            const res = await axios.delete(`${import.meta.env.VITE_API_URL}/api/v1/post/comment/${comment._id}`, {
                withCredentials: true
            });
            
            if (res.data.success) {
                toast.success(res.data.message);
                onDeleteComment(comment._id);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || 'Failed to delete comment');
        }
    };

    return (
        <div className='my-2'>
            <div className='flex gap-3 items-start justify-between'>
                <div className='flex gap-3 items-center flex-1'>
                    <Avatar>
                        <AvatarImage src={comment?.author?.profilePicture} />
                        <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold">
                            {getUserInitials(comment?.author?.username)}
                        </AvatarFallback>
                    </Avatar>
                    <h1 className='font-bold text-sm text-gray-900 dark:text-white'>
                        {comment?.author.username} 
                        <span className='font-normal pl-1 text-gray-700 dark:text-gray-300'>
                            {comment?.text}
                        </span>
                    </h1>
                </div>
                {user?._id === comment?.author?._id && (
                    <button
                        onClick={handleDeleteComment}
                        className='text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors'
                        title="Delete comment"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
        </div>
    )
}

export default Comment