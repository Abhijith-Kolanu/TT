import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
import SuggestedUsers from './SuggestedUsers';
import { getUserInitials } from '@/lib/utils';
import { MapPin, Compass, Users, TrendingUp } from 'lucide-react';

const RightSidebar = () => {
  const { user } = useSelector(store => store.auth);
  const { posts } = useSelector(store => store.post);
  
  // Calculate user's post count
  const userPostCount = posts.filter(post => post.author._id === user?._id).length;
  
  // Calculate unique places visited (posts with location data)
  const userPosts = posts.filter(post => post.author._id === user?._id);
  const uniquePlaces = new Set();
  userPosts.forEach(post => {
    if (post.location && post.location.name) {
      uniquePlaces.add(post.location.name);
    }
  });
  const placesCount = uniquePlaces.size;

  return (
    <div className='fixed top-0 right-0 w-80 h-screen bg-gradient-to-b from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-l border-gray-200 dark:border-gray-700 z-10 overflow-y-auto sidebar-scroll xl:block hidden transition-all duration-300'>
      <div className='p-6 space-y-6'>
        {/* User Profile Card */}
        <div className='bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300'>
          <div className='flex items-center gap-4'>
            <Link to={`/profile/${user?._id}`} className='relative group'>
              <Avatar className='w-16 h-16 ring-2 ring-blue-100 dark:ring-blue-900/50 group-hover:ring-blue-200 dark:group-hover:ring-blue-800 transition-all'>
                <AvatarImage src={user?.profilePicture} alt="profile_image" />
                <AvatarFallback className='text-lg font-bold bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-700 dark:text-blue-300'>
                  {getUserInitials(user?.username)}
                </AvatarFallback>
              </Avatar>
              <div className='absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800'></div>
            </Link>
            <div className='flex-1 min-w-0'>
              <h1 className='font-bold text-lg truncate'>
                <Link to={`/profile/${user?._id}`} className='hover:text-blue-600 dark:hover:text-blue-400 text-gray-900 dark:text-white transition-colors'>
                  {user?.username}
                </Link>
              </h1>
              <p className='text-gray-500 dark:text-gray-400 text-sm truncate flex items-center gap-1'>
                <MapPin size={12} />
                {user?.bio || 'Explorer'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className='bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700'>
          <h2 className='font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
            <TrendingUp size={18} className='text-blue-500' />
            Your Journey
          </h2>
          <div className='grid grid-cols-2 gap-4'>
            <div className='text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl'>
              <div className='font-bold text-2xl text-blue-600 dark:text-blue-400'>{userPostCount}</div>
              <div className='text-xs text-gray-600 dark:text-gray-400'>Posts</div>
            </div>
            <div className='text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl'>
              <div className='font-bold text-2xl text-purple-600 dark:text-purple-400'>{placesCount}</div>
              <div className='text-xs text-gray-600 dark:text-gray-400'>Places</div>
            </div>
          </div>
        </div>

        {/* Discover Section */}
        <div className='bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700'>
          <h2 className='font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
            <Compass size={18} className='text-green-500' />
            Connect & Explore
          </h2>
          <SuggestedUsers/>
        </div>

        {/* Travel Tips Card */}
        <div className='bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg'>
          <h3 className='font-bold text-lg mb-2'>✈️ Explore More</h3>
          <p className='text-blue-100 text-sm mb-3'>Share your adventures and discover new places with fellow travelers!</p>
          <button className='w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg py-2 px-4 text-sm font-medium transition-all duration-200'>
            Start Exploring
          </button>
        </div>
      </div>
    </div>
  )
}

export default RightSidebar