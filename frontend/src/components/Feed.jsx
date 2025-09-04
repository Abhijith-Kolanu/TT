import React from 'react'
import Posts from './Posts'

const Feed = () => {
  return (
    <div className='flex-1 my-8 flex flex-col items-center justify-start min-h-full transition-colors duration-200'>
        <div className='w-full max-w-lg px-4'>
            <Posts/>
        </div>
    </div>
  )
}

export default Feed