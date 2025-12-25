import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { getUserInitials } from '@/lib/utils';
import { setSelectedUser } from '@/redux/authSlice';
import { ArrowLeft, MapPin, Globe, Briefcase, IndianRupee, Star, MessageCircle, Calendar, Loader2, X } from 'lucide-react';

const GuideProfile = ({ guideId, onBack, isOwnProfileView }) => {
  const { user } = useSelector(store => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [dates, setDates] = useState({ startDate: '', endDate: '', message: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/guide/${guideId}`);
        setProfile(res.data.profile);
      } catch (err) {
        setError('Failed to load guide profile.');
      } finally {
        setLoading(false);
      }
    };
    const fetchBooking = async () => {
      if (!user?._id || !guideId) return;
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/booking/status/${guideId}`, { withCredentials: true });
        setBooking(res.data.booking);
      } catch {
        setBooking(null);
      }
    };
    if (guideId) {
      fetchProfile();
      fetchBooking();
    }
  }, [guideId, user]);

  if (!guideId) return null;
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-500 dark:text-gray-400">Loading profile...</span>
      </div>
    );
  }
  
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!profile) return <div className="text-center py-8 text-gray-500">Guide not found.</div>;

  const isOwnProfile = user && profile.user && user._id === profile.user._id;

  return (
    <div className="space-y-5">
      {/* Back Button */}
      {!isOwnProfileView && (
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to search
        </button>
      )}

      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start gap-5">
        <Avatar className="w-20 h-20 ring-4 ring-white dark:ring-gray-700 shadow-lg flex-shrink-0">
          <AvatarImage src={profile.user.profilePicture} alt="guide" />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-2xl">
            {getUserInitials(profile.user.username)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile.user.username}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-medium">{profile.rating || '5.0'}</span>
                </div>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                  <IndianRupee className="w-4 h-4" />
                  {profile.pricing}/day
                </span>
              </div>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mt-3">{profile.bio}</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-2">
            <MapPin className="w-4 h-4" />
            Locations
          </div>
          <div className="flex flex-wrap gap-1">
            {profile.locations.map(loc => (
              <span key={loc} className="px-2 py-1 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs rounded-lg border border-gray-200 dark:border-gray-500">
                {loc}
              </span>
            ))}
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-2">
            <Globe className="w-4 h-4" />
            Languages
          </div>
          <div className="flex flex-wrap gap-1">
            {profile.languages.map(lang => (
              <span key={lang} className="px-2 py-1 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs rounded-lg border border-gray-200 dark:border-gray-500">
                {lang}
              </span>
            ))}
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-2">
            <Briefcase className="w-4 h-4" />
            Expertise
          </div>
          <div className="flex flex-wrap gap-1">
            {profile.expertise.map(exp => (
              <span key={exp} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs rounded-lg">
                {exp}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Section */}
      {!isOwnProfile && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          {booking && (booking.status === 'accepted' || booking.status === 'pending') ? (
            <div className="space-y-3">
              {booking.status === 'accepted' && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <p className="text-green-700 dark:text-green-300 font-medium mb-3">✓ Booking confirmed!</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                      onClick={() => {
                        dispatch(setSelectedUser(profile.user));
                        navigate('/chat', { state: { selectedUser: profile.user } });
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message Guide
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      disabled={bookingLoading}
                      onClick={async () => {
                        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
                        setBookingLoading(true);
                        setBookingError('');
                        try {
                          const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/v1/booking/${booking._id}`, { status: 'cancelled' }, { withCredentials: true });
                          if (res.data.success) {
                            try {
                              const statusRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/booking/status/${guideId}`, { withCredentials: true });
                              setBooking(statusRes.data.booking);
                            } catch {
                              setBooking(null);
                            }
                          } else {
                            setBookingError(res.data.message || 'Cancel failed');
                          }
                        } catch (err) {
                          setBookingError('Cancel failed');
                        } finally {
                          setBookingLoading(false);
                        }
                      }}
                    >
                      {bookingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cancel Booking'}
                    </Button>
                  </div>
                </div>
              )}
              {booking.status === 'pending' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="font-medium">Booking pending approval...</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    disabled={bookingLoading}
                    onClick={async () => {
                      if (!window.confirm('Cancel this booking request?')) return;
                      setBookingLoading(true);
                      try {
                        await axios.put(`${import.meta.env.VITE_API_URL}/api/v1/booking/${booking._id}`, { status: 'cancelled' }, { withCredentials: true });
                        setBooking(null);
                      } catch {
                        setBookingError('Cancel failed');
                      } finally {
                        setBookingLoading(false);
                      }
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          ) : booking && booking.status === 'rejected' ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-600 dark:text-red-400 font-medium">Booking was declined. You can try booking again.</p>
              <Button 
                className="mt-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                onClick={() => { setBooking(null); setShowBookingForm(true); }}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Again
              </Button>
            </div>
          ) : (
            <>
              {!showBookingForm ? (
                <Button 
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  onClick={() => setShowBookingForm(true)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book This Guide
                </Button>
              ) : (
                <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Book Guide</h3>
                    <button 
                      onClick={() => setShowBookingForm(false)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  <form className="space-y-4" onSubmit={async e => {
                    e.preventDefault();
                    setBookingLoading(true);
                    setBookingError('');
                    try {
                      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/booking`, {
                        guideId: profile.user._id,
                        startDate: dates.startDate,
                        endDate: dates.endDate,
                        message: dates.message
                      }, { withCredentials: true });
                      if (res.data.success) {
                        setBooking(res.data.booking);
                        setShowBookingForm(false);
                      } else {
                        setBookingError(res.data.message || 'Booking failed');
                      }
                    } catch (err) {
                      setBookingError('Booking failed');
                    } finally {
                      setBookingLoading(false);
                    }
                  }}>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                        <input 
                          type="date" 
                          className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white" 
                          required 
                          value={dates.startDate} 
                          onChange={e => setDates(d => ({ ...d, startDate: e.target.value }))} 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                        <input 
                          type="date" 
                          className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white" 
                          required 
                          value={dates.endDate} 
                          onChange={e => setDates(d => ({ ...d, endDate: e.target.value }))} 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message (optional)</label>
                      <textarea 
                        className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white resize-none" 
                        rows={3}
                        placeholder="Tell the guide about your trip plans..."
                        value={dates.message} 
                        onChange={e => setDates(d => ({ ...d, message: e.target.value }))} 
                      />
                    </div>
                    {bookingError && <div className="text-red-500 text-sm">{bookingError}</div>}
                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white" 
                        disabled={bookingLoading}
                      >
                        {bookingLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GuideProfile;
