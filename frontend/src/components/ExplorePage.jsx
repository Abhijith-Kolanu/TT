import React from 'react';
import useGetExplorePosts from '@/hooks/useGetExplorePosts';
import { useSelector } from 'react-redux';

// WRONG PATH: import Post from './components/Post.jsx';
// CORRECT PATH:
import Post from './Post'; // It's in the same directory

const ExplorePage = () => {
    // This hook fetches the data and updates the Redux store.
    useGetExplorePosts();

    // Get the data from the Redux store.
    const { explorePosts } = useSelector(store => store.post);

    // Case 1: The data is still being fetched.
    if (!Array.isArray(explorePosts)) {
        return (
            <div className='flex justify-center items-center h-full bg-white dark:bg-gray-900 transition-all duration-300'>
                <p className='text-gray-900 dark:text-white'>Loading...</p>
            </div>
        );
    }

    // Case 2: The fetch is complete, but there are no posts.
    if (explorePosts.length === 0) {
        return (
            <div className='bg-white dark:bg-gray-900 min-h-screen transition-all duration-300'>
                <div className='flex flex-col items-center justify-center h-screen'>
                    <div className='text-center px-6'>
                        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Explore</h1>
                        <p className="text-gray-600 dark:text-gray-400">No new posts to discover right now!</p>
                    </div>
                </div>
            </div>
        );
    }

    // Case 3: We have posts to display.
    return (
        <div className='bg-white dark:bg-gray-900 min-h-screen transition-all duration-300'>
            <div className='flex flex-col items-center justify-start pt-0'>
                <div className='w-full max-w-lg px-6 pt-8'>
                    <h1 className="text-2xl font-bold mb-8 text-center text-gray-900 dark:text-white">Explore</h1>
                    <div className="space-y-8">
                        {explorePosts.map((post) => (
                            <Post key={post._id} post={post} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExplorePage;