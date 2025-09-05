import React from 'react'
import Posts from './Posts'

const Feed = () => {
  return (
    <div className='flex-1 pt-8 flex flex-col items-center justify-start transition-colors duration-200'>
        <Posts/>
    </div>
  )
}

export default Feed