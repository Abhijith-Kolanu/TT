import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
import SuggestedUsers from './SuggestedUsers';
import { getUserInitials } from '@/lib/utils';
import { Users, Mountain } from 'lucide-react';

const StatPill = ({ value, label, gradient }) => (
  <Link to='#' className='flex-1 flex flex-col items-center py-3 hover:bg-white/60 dark:hover:bg-white/5 transition-colors rounded-xl'>
    <span className={`text-xl font-extrabold leading-none bg-gradient-to-b ${gradient} bg-clip-text text-transparent`}>{value}</span>
    <span className='text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider mt-1'>{label}</span>
  </Link>
);

const RightSidebar = () => {
  const { user } = useSelector(store => store.auth);

  // Use user.posts (same source as Profile page) so counts are always consistent
  const userPostCount = user?.posts?.length ?? 0;
  const followersCount = user?.followers?.length ?? 0;
  const followingCount = user?.following?.length ?? 0;

  return (
    <div className='fixed top-0 right-0 w-[285px] h-screen bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 z-10 overflow-y-auto sidebar-scroll xl:block hidden'>
      <style>{`
        @keyframes rs-slide {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .rs-bar {
          background: linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6, #06b6d4, #10b981, #f59e0b, #ef4444, #3b82f6);
          background-size: 300% 100%;
          animation: rs-slide 6s linear infinite;
        }
        .rs-ring {
          background: linear-gradient(135deg, #3b82f6, #6366f1, #8b5cf6, #ec4899, #f59e0b, #10b981, #3b82f6);
          background-size: 300% 300%;
          animation: rs-slide 5s linear infinite;
        }
      `}</style>

      {/* Animated top bar */}
      <div className='rs-bar h-[3px] w-full sticky top-0 z-20'></div>

      {/* ── Profile Hero ── */}
      <div>
        {/* Cover banner */}
        <div className='h-[72px] bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 relative overflow-hidden'>
          <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.2)_0%,transparent_65%)]'></div>
          <div className='absolute -bottom-4 right-6 w-20 h-20 bg-white/10 rounded-full blur-xl'></div>
          <div className='absolute top-1 left-1/3 w-10 h-10 bg-cyan-300/20 rounded-full blur-lg'></div>
        </div>

        {/* Avatar + info */}
        <div className='flex flex-col items-center px-5 pb-5 -mt-9'>
          {/* Rainbow ring avatar */}
          <Link to={`/profile/${user?._id}`}>
            <div className='rs-ring rounded-full p-[2.5px] shadow-lg'>
              <div className='bg-white dark:bg-gray-900 rounded-full p-[2px]'>
                <Avatar className='w-[58px] h-[58px]'>
                  <AvatarImage src={user?.profilePicture} alt="profile" />
                  <AvatarFallback className='text-lg font-bold bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 text-white'>
                    {getUserInitials(user?.username)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </Link>

          <Link to={`/profile/${user?._id}`} className='mt-2.5 group'>
            <p className='font-extrabold text-[15px] text-center bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent group-hover:opacity-75 transition-opacity leading-tight'>
              {user?.username}
            </p>
          </Link>

          <p className='text-[11px] text-gray-400 dark:text-gray-500 text-center mt-1 max-w-[200px] leading-snug line-clamp-2'>
            {user?.bio || 'Travel enthusiast ✈️'}
          </p>

          {/* Inline stats bar */}
          <div className='w-full mt-4 flex items-stretch bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/40 divide-x divide-gray-100 dark:divide-gray-700/40 overflow-hidden'>
            <StatPill value={userPostCount} label="Posts" gradient="from-blue-500 to-indigo-600" />
            <StatPill value={followersCount} label="Followers" gradient="from-violet-500 to-purple-600" />
            <StatPill value={followingCount} label="Following" gradient="from-indigo-500 to-blue-600" />
          </div>


        </div>
      </div>

      {/* Divider */}
      <div className='mx-4 h-px bg-gray-100 dark:bg-gray-800'></div>

      {/* ── Suggested Users ── */}
      <div className='px-4 pt-4 pb-3'>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-2'>
            <div className='w-5 h-5 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center'>
              <Users size={11} className='text-white' />
            </div>
            <span className='text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider'>Who to Follow</span>
          </div>
        </div>
        <SuggestedUsers />
      </div>

      {/* Divider */}
      <div className='mx-4 h-px bg-gray-100 dark:bg-gray-800'></div>

      {/* ── Adventure Banner ── */}
      <div className='mx-4 my-4 relative overflow-hidden rounded-2xl text-white'>
        {/* Background */}
        <div className='absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600'></div>
        {/* Decorative shapes */}
        <div className='absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl'></div>
        <div className='absolute -bottom-5 -left-5 w-24 h-24 bg-cyan-400/20 rounded-full blur-xl'></div>

        <div className='relative z-10 p-4 flex items-start gap-3'>
          <div className='flex-shrink-0 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-inner border border-white/20'>
            <Mountain className='w-5 h-5 text-white' />
          </div>
          <div>
            <p className='font-bold text-sm leading-tight mb-1'>Your Journey Starts Here!</p>
            <p className='text-blue-100/90 text-[11px] leading-relaxed mb-2.5'>Plan trips, track footsteps, keep journals & connect with guides worldwide.</p>
            <div className='flex flex-wrap gap-1'>
              {['#tripplanner', '#footsteps', '#guides', '#journal'].map(tag => (
                <span key={tag} className='text-[9px] font-bold bg-white/15 border border-white/20 rounded-full px-2 py-0.5 tracking-wide'>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default RightSidebar