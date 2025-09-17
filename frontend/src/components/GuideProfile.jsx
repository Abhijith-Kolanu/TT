import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { getUserInitials } from '@/lib/utils';
import { setSelectedUser } from '@/redux/authSlice';

const GuideProfile = ({ guideId, onBack }) => {
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
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!profile) return <div>Guide not found.</div>;

  // Don't show connect button if viewing own profile
  const isOwnProfile = user && profile.user && user._id === profile.user._id;

  return (
    <div className="guide-profile p-4 border rounded">
      <button onClick={onBack} className="mb-2 text-blue-500">&larr; Back to search</button>
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="w-16 h-16 ring-4 ring-white dark:ring-gray-700 shadow-xl duration-300">
          <AvatarImage src={profile.user.profilePicture} alt="traveler_image" />
          <AvatarFallback className="bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 text-white font-bold text-xl">
            {getUserInitials(profile.user.username)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-bold text-lg">{profile.user.username}</div>
          <div className="text-gray-500">{profile.bio}</div>
          <div className="text-xs text-gray-400">{profile.locations.join(', ')} | {profile.languages.join(', ')}</div>
        </div>
      </div>
      <div className="mb-2"><b>Expertise:</b> {profile.expertise.join(', ')}</div>
      <div className="mb-2"><b>Locations:</b> {profile.locations.join(', ')}</div>
      <div className="mb-2"><b>Languages:</b> {profile.languages.join(', ')}</div>
      <div className="mb-2"><b>Pricing:</b> ₹{profile.pricing}/day</div>
      <div className="mb-2"><b>Rating:</b> {profile.rating} ⭐</div>
      {!isOwnProfile && (
        <>
          {booking && (booking.status === 'accepted' || booking.status === 'pending') ? (
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              {booking.status === 'accepted' && (
                <Button
                  className="btn-adventure px-6 py-2 rounded"
                  onClick={() => {
                    dispatch(setSelectedUser(profile.user));
                    navigate('/chat', { state: { selectedUser: profile.user } });
                  }}
                >
                  Message Booked Guide
                </Button>
              )}
              {booking.status === 'pending' && (
                <div className="text-blue-600 font-semibold flex items-center">Booking pending approval...</div>
              )}
              <Button
                variant="outline"
                className="px-6 py-2 rounded border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                disabled={bookingLoading}
                onClick={async () => {
                  if (!window.confirm('Are you sure you want to cancel this booking?')) return;
                  setBookingLoading(true);
                  setBookingError('');
                  try {
                    const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/v1/booking/${booking._id}`, { status: 'cancelled' }, { withCredentials: true });
                    if (res.data.success) {
                      // Re-fetch booking status to ensure UI is in sync
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
                {bookingLoading ? 'Cancelling...' : 'Cancel Booking'}
              </Button>
            </div>
          ) : booking && booking.status === 'rejected' ? (
            <div className="mt-4 text-red-600 font-semibold">Booking was rejected.</div>
          ) : (
            <>
              {!showBookingForm ? (
                <Button className="mt-4 btn-adventure px-6 py-2 rounded" onClick={() => setShowBookingForm(true)}>
                  Book Guide
                </Button>
              ) : (
                <form className="mt-4 space-y-2" onSubmit={async e => {
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
                  <div>
                    <label className="block text-sm font-medium">Start Date</label>
                    <input type="date" className="input w-full" required value={dates.startDate} onChange={e => setDates(d => ({ ...d, startDate: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">End Date</label>
                    <input type="date" className="input w-full" required value={dates.endDate} onChange={e => setDates(d => ({ ...d, endDate: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Message (optional)</label>
                    <textarea className="input w-full" value={dates.message} onChange={e => setDates(d => ({ ...d, message: e.target.value }))} />
                  </div>
                  {bookingError && <div className="text-red-500 text-sm">{bookingError}</div>}
                  <Button type="submit" className="btn-adventure px-6 py-2 rounded" disabled={bookingLoading}>{bookingLoading ? 'Booking...' : 'Submit Booking'}</Button>
                  <Button type="button" variant="outline" className="ml-2" onClick={() => setShowBookingForm(false)}>Cancel</Button>
                </form>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default GuideProfile;
