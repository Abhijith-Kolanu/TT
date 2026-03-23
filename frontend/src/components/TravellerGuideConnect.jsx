import React, { useState, useEffect } from 'react';
import GuideSearch from './GuideSearch';
import GuideProfile from './GuideProfile';
import GuideRegistrationForm from './GuideRegistrationForm';
import GuideBookingRequests from './GuideBookingRequests';
import AssignedGuide from './AssignedGuide';
import MyGuideRequests from './MyGuideRequests';
import GuideBookingHistory from './GuideBookingHistory';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Compass, UserCircle2, Inbox, Search, Loader2, Send, Clock3 } from 'lucide-react';

const TravellerGuideConnect = () => {
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [myGuideProfile, setMyGuideProfile] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [showGuideForm, setShowGuideForm] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [incomingRequestsCount, setIncomingRequestsCount] = useState(0);
  const { user } = useSelector(store => store.auth);

  const isGuide = Boolean(myGuideProfile);

  const fetchMyProfile = async () => {
    if (!user?._id) {
      setMyGuideProfile(null);
      setIsProfileLoading(false);
      return;
    }

    try {
      setIsProfileLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/guide/me`, {
          withCredentials: true
        });
        if (res.data.success) {
          setMyGuideProfile(res.data.profile);
          return;
        }
      } catch {
      }

      const fallbackRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/guide/${user._id}`);
      if (fallbackRes.data.success) {
        setMyGuideProfile(fallbackRes.data.profile);
      } else {
        setMyGuideProfile(null);
      }
    } catch {
      setMyGuideProfile(null);
    } finally {
      setIsProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProfile();
  }, [user]);

  useEffect(() => {
    if (!isGuide && (activeTab === 'myprofile' || activeTab === 'requests')) {
      setActiveTab('search');
    }
  }, [isGuide, activeTab]);

  useEffect(() => {
    if (!user?._id || !isGuide) {
      setIncomingRequestsCount(0);
      return;
    }

    let isMounted = true;

    const fetchIncomingRequestsCount = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/booking`, { withCredentials: true });
        const pendingCount = (res.data?.asGuide || []).filter(booking => booking.status === 'pending').length;
        if (isMounted) {
          setIncomingRequestsCount(pendingCount);
        }
      } catch {
        if (isMounted) {
          setIncomingRequestsCount(0);
        }
      }
    };

    fetchIncomingRequestsCount();
    const intervalId = window.setInterval(fetchIncomingRequestsCount, 10000);

    const handleGuideBookingsUpdated = () => fetchIncomingRequestsCount();
    const handleWindowFocus = () => fetchIncomingRequestsCount();

    window.addEventListener('guide-bookings-updated', handleGuideBookingsUpdated);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener('guide-bookings-updated', handleGuideBookingsUpdated);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [user?._id, isGuide]);

  const renderTabContent = () => {
    if (activeTab === 'search') {
      return <GuideSearch onSelectGuide={guide => setSelectedGuide(guide)} />;
    }

    if (activeTab === 'myrequests') {
      return <MyGuideRequests onOpenGuide={(guideId) => setSelectedGuide({ user: { _id: guideId } })} />;
    }

    if (activeTab === 'myprofile') {
      return <GuideProfile guideId={user?._id} onBack={() => {}} isOwnProfileView />;
    }

    if (activeTab === 'history') {
      return <GuideBookingHistory />;
    }

    return <GuideBookingRequests />;
  };

  const tabButtonClass = (tabName) => `flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl transition-all whitespace-nowrap min-h-[44px] ${
    activeTab === tabName
      ? 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 shadow-sm ring-1 ring-blue-200 dark:ring-blue-700'
      : 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/70 ring-1 ring-gray-200 dark:ring-gray-700'
  }`;

  return (
    <div className="w-full max-w-[1480px] mx-auto px-3 md:px-6 py-6 space-y-6">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-7 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Guide Connect</h1>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Find guides, manage requests, review incoming bookings, and track your history</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {isGuide && incomingRequestsCount > 0 && (
                  <span className="px-2.5 py-1 text-xs rounded-full bg-blue-600 text-white">
                    {incomingRequestsCount > 99 ? '99+' : incomingRequestsCount} incoming
                  </span>
                )}
              </div>
            </div>
          </div>
          {user && (
            <button
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={() => setShowGuideForm(f => !f)}
            >
              {isGuide ? 'Edit Guide Profile' : 'Become a Guide'}
            </button>
          )}
        </div>
      </div>

      {/* Guide Registration Form */}
      {showGuideForm && (
        <div className="mb-6">
          <GuideRegistrationForm 
            profile={myGuideProfile} 
            onSuccess={async p => {
              setMyGuideProfile(p);
              setShowGuideForm(false);
              await fetchMyProfile();
            }} 
            onCancel={() => setShowGuideForm(false)}
          />
        </div>
      )}

      {/* Assigned Guide Section (traveller view) */}
      <AssignedGuide />

      {isProfileLoading && !showGuideForm && !selectedGuide && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Loading Guide Connect...</span>
        </div>
      )}

      {/* Tab Navigation */}
      {!isProfileLoading && !showGuideForm && !selectedGuide && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/50">
            <div className={`grid gap-2 ${isGuide ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-5' : 'grid-cols-1 sm:grid-cols-3'}`}>
            <button
              onClick={() => setActiveTab('search')}
              className={tabButtonClass('search')}
            >
              <Search className="w-4 h-4 flex-shrink-0" />
              Find Guides
            </button>
            <button
              onClick={() => setActiveTab('myrequests')}
              className={tabButtonClass('myrequests')}
            >
              <Send className="w-4 h-4 flex-shrink-0" />
              My Requests
            </button>

            {isGuide && (
              <>
                <button
                  onClick={() => setActiveTab('requests')}
                  className={tabButtonClass('requests')}
                >
                  <Inbox className="w-4 h-4 flex-shrink-0" />
                  Incoming Requests
                  {incomingRequestsCount > 0 && (
                    <span className="ml-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-blue-500 text-white leading-tight">
                      {incomingRequestsCount > 99 ? '99+' : incomingRequestsCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('myprofile')}
                  className={tabButtonClass('myprofile')}
                >
                  <UserCircle2 className="w-4 h-4 flex-shrink-0" />
                  My Profile
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={tabButtonClass('history')}
                >
                  <Clock3 className="w-4 h-4 flex-shrink-0" />
                  History
                </button>
              </>
            )}

            {!isGuide && (
              <button
                onClick={() => setActiveTab('history')}
                className={tabButtonClass('history')}
              >
                <Clock3 className="w-4 h-4 flex-shrink-0" />
                History
              </button>
            )}
            </div>
          </div>

          <div className="p-5 md:p-6 bg-gradient-to-b from-transparent to-gray-50/30 dark:to-gray-900/20">
            {renderTabContent()}
          </div>
        </div>
      )}

      {/* Selected Guide Profile */}
      {selectedGuide?.user?._id && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <GuideProfile guideId={selectedGuide.user._id} onBack={() => setSelectedGuide(null)} />
        </div>
      )}
    </div>
  );
};

export default TravellerGuideConnect;
