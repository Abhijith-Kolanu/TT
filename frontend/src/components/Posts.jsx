import React from 'react'
import Post from './Post'
import { useSelector } from 'react-redux'

const Posts = () => {
  const {posts} = useSelector(store=>store.post);

  return (
    <div className="w-full max-w-lg mx-auto space-y-8 transition-colors duration-200">
        {
            posts.map((post) => (
              <div key={post._id}>
                <Post post={post}/>
              </div>
            ))
        }
    </div>
  )
}

export default Posts