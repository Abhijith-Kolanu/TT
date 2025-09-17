import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

const MainLayout = () => {
  const location = useLocation();
  const isMessagesPage = location.pathname === '/chat';
  const isGuideConnectPage = location.pathname === '/guides';
  const isFootstepsPage = location.pathname === '/footsteps';
  const isTripPlannerPage = location.pathname === '/planner';
  const isTripDetailPage = location.pathname.startsWith('/trip/');
  const isProfilePage = location.pathname.startsWith('/profile/');
  const isScrapbookPage = location.pathname === '/scrapbook';
  const isJournalPage = location.pathname === '/journal';
  const isHomePage = location.pathname === '/';
  const isExplorePage = location.pathname === '/explore';
  
  // Check if current page is any trip-related page
  const isTripRelatedPage = isTripPlannerPage || isTripDetailPage;
  
  // Pages that should not have padding (they handle their own layout)
  const isFullLayoutPage = isFootstepsPage || isHomePage || isExplorePage || isScrapbookPage || isJournalPage;

  return (
    // Use Flexbox to create a row layout with proper overflow handling
    <div className='flex w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 dark:from-gray-900 dark:via-blue-950 dark:to-green-950 transition-all duration-300 travel-pattern'>
      
      {/* 
        The LeftSidebar is using 'fixed' positioning and is now scrollable independently
      */}
      <LeftSidebar />

      {/* 
        The RightSidebar is also using 'fixed' positioning and is static
        Hide it on the Messages page, Footsteps page, Profile pages, Scrapbook page, Journal page, and all Trip-related pages for better experience
      */}
  {!isMessagesPage && !isFootstepsPage && !isProfilePage && !isScrapbookPage && !isJournalPage && !isTripRelatedPage && !isGuideConnectPage && <RightSidebar />}

      {/* 
        This is the main content area that will hold our pages.
        We will give it a left margin equal to the width of the left sidebar (w-64)
        and right margin for the right sidebar (w-72) to prevent overlapping.
        On Messages page, Footsteps page, Profile pages, Scrapbook page, and all Trip-related pages, we don't add right margin since RightSidebar is hidden
      */}
      <main className={`flex-1 lg:ml-64 ${!isMessagesPage && !isFootstepsPage && !isProfilePage && !isScrapbookPage && !isJournalPage && !isTripRelatedPage ? 'xl:mr-72' : ''} overflow-y-auto`}>  
        {/* 
          lg:ml-64 adds left margin only on large screens when LeftSidebar is visible (w-64).
          xl:mr-72 adds right margin only on extra large screens when RightSidebar is visible (w-72).
          The 'flex-1' tells this element to take up the remaining available space.
          overflow-y-auto makes the main content independently scrollable.
          RightSidebar is hidden on Messages, Footsteps, Profile, Scrapbook, Journal, and Trip-related pages.
        */}
        <div className={`${isFullLayoutPage ? '' : 'p-4'} min-h-full`}> {/* Remove padding for pages that handle their own layout */}
          <Outlet />
        </div>
      </main>
      
    </div>
  );
};

export default MainLayout;