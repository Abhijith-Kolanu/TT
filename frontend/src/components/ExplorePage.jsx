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
    if (explorePosts === null) {
        return (
            <div className='flex justify-center items-center h-full'>
                <p>Loading...</p> 
            </div>
        );
    }

    // Case 2: The fetch is complete, but there are no posts.
    if (explorePosts.length === 0) {
        return (
            <div>
                <h1 className="text-2xl font-bold mb-4 text-center">Explore</h1>
                <p className="text-center">No new posts to discover right now!</p>
            </div>
        );
    }

    // Case 3: We have posts to display.
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Explore</h1>
            <div className="flex flex-col items-center gap-4">
                {explorePosts.map((post) => (
                    <Post key={post._id} post={post} />
                ))}
            </div>
        </div>
    );
};

export default ExplorePage;