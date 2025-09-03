import React from 'react'
import Feed from './Feed'
import { Outlet } from 'react-router-dom'
import useGetAllPost from '@/hooks/useGetAllPost'
import useGetSuggestedUsers from '@/hooks/useGetSuggestedUsers'

const Home = () => {
    useGetAllPost();
    useGetSuggestedUsers();
    return (
        <div className='w-full'>
            <Feed />
            <Outlet />
        </div>
    )
}

export default Home