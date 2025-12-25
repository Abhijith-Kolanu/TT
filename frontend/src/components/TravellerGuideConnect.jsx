import React, { useState, useEffect } from 'react';
import GuideSearch from './GuideSearch';
import GuideProfile from './GuideProfile';
import GuideRegistrationForm from './GuideRegistrationForm';
import GuideBookingRequests from './GuideBookingRequests';
import AssignedGuide from './AssignedGuide';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Compass, UserCheck, MapPin, Users } from 'lucide-react';

const TravellerGuideConnect = () => {
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [myGuideProfile, setMyGuideProfile] = useState(null);
  const [showGuideForm, setShowGuideForm] = useState(false);
  const [activeTab, setActiveTab] = useState('search'); // 'search', 'myprofile', 'requests'
  const { user } = useSelector(store => store.auth);

  useEffect(() => {
    const fetchMyProfile = async () => {
      if (!user?._id) return;
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/guide/${user._id}`);
        if (res.data.success) setMyGuideProfile(res.data.profile);
        else setMyGuideProfile(null);
      } catch {
        setMyGuideProfile(null);
      }
    };
    fetchMyProfile();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Guide Connect</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Find local guides for your adventures</p>
            </div>
          </div>
          {user && (
            <button
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={() => setShowGuideForm(f => !f)}
            >
              {myGuideProfile ? 'Edit Guide Profile' : 'Become a Guide'}
            </button>
          )}
        </div>
      </div>

      {/* Guide Registration Form */}
      {showGuideForm && (
        <div className="mb-6">
          <GuideRegistrationForm 
            profile={myGuideProfile} 
            onSuccess={p => { setMyGuideProfile(p); setShowGuideForm(false); }} 
            onCancel={() => setShowGuideForm(false)}
          />
        </div>
      )}

      {/* Assigned Guide Section */}
      <AssignedGuide />

      {/* Tab Navigation for Guides */}
      {myGuideProfile && !showGuideForm && !selectedGuide && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'search'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <Users size={16} />
              Find Guides
            </button>
            <button
              onClick={() => setActiveTab('myprofile')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'myprofile'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <UserCheck size={16} />
              My Profile
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'requests'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <MapPin size={16} />
              Requests
            </button>
          </div>

          <div className="p-5">
            {activeTab === 'search' && (
              <GuideSearch onSelectGuide={guide => setSelectedGuide(guide)} />
            )}
            {activeTab === 'myprofile' && (
              <GuideProfile guideId={user._id} onBack={() => {}} isOwnProfileView />
            )}
            {activeTab === 'requests' && (
              <GuideBookingRequests />
            )}
          </div>
        </div>
      )}

      {/* Guide Search or Selected Guide Profile (for non-guides) */}
      {(!myGuideProfile || showGuideForm) && !selectedGuide && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <GuideSearch onSelectGuide={guide => setSelectedGuide(guide)} />
        </div>
      )}

      {/* Selected Guide Profile */}
      {selectedGuide && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <GuideProfile guideId={selectedGuide.user._id} onBack={() => setSelectedGuide(null)} />
        </div>
      )}
    </div>
  );
};

export default TravellerGuideConnect;
