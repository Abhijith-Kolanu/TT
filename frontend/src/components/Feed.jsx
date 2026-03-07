import React from 'react'
import Posts from './Posts'
import { Flame } from 'lucide-react'

const Feed = () => {
  return (
    <div className='flex-1 flex flex-col items-center justify-start'>

      {/* Feed header — matches sidebar design language */}
      <div className='w-full max-w-lg mx-auto px-0 pt-6 pb-2 sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md'>
        {/* Rainbow bar */}
        <div className='feed-rainbow-bar' style={{ height: '2px', borderRadius: '0 0 4px 4px' }} />
        <div className='flex items-center gap-2 px-1 pt-3 pb-2'>
          <div className='w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm'>
            <Flame size={13} className='text-white' />
          </div>
          <h1 className='font-extrabold text-base bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight'>
            Your Feed
          </h1>
        </div>
        <div className='h-px bg-gradient-to-r from-transparent via-blue-100 dark:via-blue-900/40 to-transparent' />
      </div>

      <div className='w-full max-w-lg mx-auto pt-4'>
        <Posts />
      </div>
    </div>
  )
}

export default Feed