import React from 'react'
import Post from './Post'
import { useSelector } from 'react-redux'
import { Compass } from 'lucide-react'

const Posts = () => {
  const { posts, followingEndIndex } = useSelector(store => store.post);
  const hasFollowedPosts = followingEndIndex > 0;
  const hasDiscoverPosts = followingEndIndex < posts.length;

  return (
    <div className="w-full max-w-lg mx-auto space-y-6 pb-8">
        {
            posts.map((post, index) => (
              <React.Fragment key={post._id}>
                {hasFollowedPosts && hasDiscoverPosts && index === followingEndIndex && (
                  <div className="flex items-center gap-3 py-3">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-200 dark:via-indigo-800/50 to-transparent" />
                    <span className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/40 text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
                      <Compass className="w-3 h-3" /> Discover More
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-200 dark:via-indigo-800/50 to-transparent" />
                  </div>
                )}
                <Post post={post} />
              </React.Fragment>
            ))
        }
    </div>
  )
}

export default Posts