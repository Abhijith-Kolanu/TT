import React from 'react';
import { Outlet } from 'react-router-dom';
import LeftSidebar from './LeftSidebar';

const MainLayout = () => {
  return (
    // Use Flexbox to create a row layout
    <div className='flex w-full min-h-screen'>
      
      {/* 
        The LeftSidebar is already using 'fixed' positioning, 
        so it takes itself out of the normal document flow. 
        That's okay, but we need to account for its width in our main content area.
      */}
      <LeftSidebar />

      {/* 
        This is the main content area that will hold our pages.
        We will give it a left margin equal to the width of the sidebar
        to prevent them from overlapping.
      */}
      <main className='flex-1 ml-[16%]'>  
        {/* 
          ml-[16%] corresponds to the w-[16%] on your LeftSidebar.
          The 'flex-1' tells this element to take up the remaining available space.
        */}
        <div className='p-4'> {/* Add some padding for content */}
          <Outlet />
        </div>
      </main>
      
    </div>
  );
};

export default MainLayout;