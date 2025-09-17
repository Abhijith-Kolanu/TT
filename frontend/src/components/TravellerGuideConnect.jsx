import React, { useState, useEffect } from 'react';
import GuideSearch from './GuideSearch';
import GuideProfile from './GuideProfile';
import GuideRegistrationForm from './GuideRegistrationForm';
import GuideBookingRequests from './GuideBookingRequests';
import AssignedGuide from './AssignedGuide';
import axios from 'axios';
import { useSelector } from 'react-redux';

const TravellerGuideConnect = () => {
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [myGuideProfile, setMyGuideProfile] = useState(null);
  const [showGuideForm, setShowGuideForm] = useState(false);
  const { user } = useSelector(store => store.auth);

  useEffect(() => {
    // Fetch my guide profile if logged in
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
    <div className="traveller-guide-connect max-w-3xl mx-auto p-4">
      {/* Section header with background */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-3xl -z-10" style={{ filter: 'blur(2px)' }}></div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 px-6 py-6 rounded-3xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Traveller–Guide Connect</h1>
          {user && (
            <button
              className="btn-adventure px-5 py-2 rounded-xl shadow-md hover:scale-105 transition-transform"
              onClick={() => setShowGuideForm(f => !f)}
            >
              {myGuideProfile ? 'Edit My Guide Profile' : 'Become a Guide'}
            </button>
          )}
        </div>
      </div>

      {/* Guide registration form */}
      {showGuideForm && (
        <div className="mb-8">
          <GuideRegistrationForm profile={myGuideProfile} onSuccess={p => { setMyGuideProfile(p); setShowGuideForm(false); }} />
        </div>
      )}

  {/* Assigned guide section for traveller */}
  <AssignedGuide />

      {/* My guide profile and booking requests (for guides) */}
      {myGuideProfile && !showGuideForm && !selectedGuide && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-600/30 shadow-xl">
            <div className="font-semibold mb-2 text-lg text-green-700 dark:text-green-300">Guide Profile</div>
            <GuideProfile guideId={user._id} onBack={() => {}} />
          </div>
          <div className="p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-600/30 shadow-xl">
            <GuideBookingRequests />
          </div>
        </div>
      )}

      {/* Guide search or selected guide profile */}
      <div className="mt-8">
        {!selectedGuide ? (
          <GuideSearch onSelectGuide={guide => setSelectedGuide(guide)} />
        ) : (
          <GuideProfile guideId={selectedGuide.user._id} onBack={() => setSelectedGuide(null)} />
        )}
      </div>
    </div>
  );
};

export default TravellerGuideConnect;
