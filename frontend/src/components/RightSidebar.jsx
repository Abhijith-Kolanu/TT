import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
import SuggestedUsers from './SuggestedUsers';
import { getUserInitials } from '@/lib/utils';

const RightSidebar = () => {
  const { user } = useSelector(store => store.auth);
  return (
    <div className='fixed top-0 right-0 w-72 h-screen bg-white dark:bg-gray-800 border-l border-gray-300 dark:border-gray-700 z-10 overflow-y-auto sidebar-scroll xl:block hidden transition-colors duration-200'>
      <div className='p-6'>
        <div className='flex items-center gap-4 mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
          <Link to={`/profile/${user?._id}`}>
            <Avatar className='w-14 h-14'>
              <AvatarImage src={user?.profilePicture} alt="profile_image" />
              <AvatarFallback className='text-lg font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'>
                {getUserInitials(user?.username)}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className='flex-1 min-w-0'>
            <h1 className='font-semibold text-base truncate'>
              <Link to={`/profile/${user?._id}`} className='hover:underline text-gray-900 dark:text-white'>
                {user?.username}
              </Link>
            </h1>
            <p className='text-gray-600 dark:text-gray-400 text-sm truncate'>{user?.bio || 'Bio here...'}</p>
          </div>
        </div>
        <SuggestedUsers/>
      </div>
    </div>
  )
}

export default RightSidebar