import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { getUserInitials } from '@/lib/utils'

const Comment = ({ comment }) => {
    return (
        <div className='my-2'>
            <div className='flex gap-3 items-center'>
                <Avatar>
                    <AvatarImage src={comment?.author?.profilePicture} />
                    <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold">
                        {getUserInitials(comment?.author?.username)}
                    </AvatarFallback>
                </Avatar>
                <h1 className='font-bold text-sm text-gray-900 dark:text-white'>{comment?.author.username} <span className='font-normal pl-1 text-gray-700 dark:text-gray-300'>{comment?.text}</span></h1>
            </div>
        </div>
    )
}

export default Comment