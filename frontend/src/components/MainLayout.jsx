import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

const MainLayout = () => {
  const location = useLocation();
  const isMessagesPage = location.pathname === '/chat';
  const isFootstepsPage = location.pathname === '/footsteps';
  const isTripPlannerPage = location.pathname === '/planner';

  return (
    // Use Flexbox to create a row layout with proper overflow handling
    <div className='flex w-full min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200'>
      
      {/* 
        The LeftSidebar is using 'fixed' positioning and is now scrollable independently
      */}
      <LeftSidebar />

      {/* 
        The RightSidebar is also using 'fixed' positioning and is static
        Hide it on the Messages page, Footsteps page, and Trip Planner page for better experience
      */}
      {!isMessagesPage && !isFootstepsPage && !isTripPlannerPage && <RightSidebar />}

      {/* 
        This is the main content area that will hold our pages.
        We will give it a left margin equal to the width of the left sidebar (w-64)
        and right margin for the right sidebar (w-72) to prevent overlapping.
        On Messages page, Footsteps page, and Trip Planner page, we don't add right margin since RightSidebar is hidden
      */}
      <main className={`flex-1 lg:ml-64 ${!isMessagesPage && !isFootstepsPage && !isTripPlannerPage ? 'xl:mr-72' : ''} overflow-y-auto`}>  
        {/* 
          lg:ml-64 adds left margin only on large screens when LeftSidebar is visible (w-64).
          xl:mr-72 adds right margin only on extra large screens when RightSidebar is visible (w-72).
          The 'flex-1' tells this element to take up the remaining available space.
          overflow-y-auto makes the main content independently scrollable.
        */}
        <div className={`${isFootstepsPage ? '' : 'p-4'} min-h-full`}> {/* Remove padding for footsteps page */}
          <Outlet />
        </div>
      </main>
      
    </div>
  );
};

export default MainLayout;