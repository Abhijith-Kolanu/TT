import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { getUserInitials } from '@/lib/utils';
import { setSelectedUser } from '@/redux/authSlice';
import { ArrowLeft, MapPin, Globe, Briefcase, IndianRupee, Star, MessageCircle, Calendar, Loader2, X, Clock3 } from 'lucide-react';

const getApiError = (error, fallback) => error?.response?.data?.message || fallback;

const normalizeDateInput = (value = '') => {
  const digits = String(value).replace(/[^0-9]/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const parseDDMMYYYYToDate = (value = '') => {
  const match = String(value).trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  date.setHours(0, 0, 0, 0);
  return date;
};

const toISODate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateDDMMYYYY = (value) => {
  if (!value) return '--/--/----';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(String(value).trim())) {
    return String(value).trim();
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--/--/----';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const parseDailyCost = (value) => {
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) return numeric;
  const cleaned = String(value || '')
    .replace(/,/g, '')
    .replace(/[^0-9.]/g, '')
    .trim();
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const getInclusiveDayCount = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = parseDDMMYYYYToDate(startDate) || new Date(startDate);
  const end = parseDDMMYYYYToDate(endDate) || new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diff = end - start;
  if (Number.isNaN(diff) || diff < 0) return 0;
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
};

const formatMoney = (value, currency = 'INR') => {
  const amount = Number(value || 0);
  return `${currency} ${amount.toLocaleString('en-IN')}`;
};

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
  const [dates, setDates] = useState({ startDate: '', endDate: '', startTime: '09:00', endTime: '18:00', message: '' });
  const startDatePickerRef = useRef(null);
  const endDatePickerRef = useRef(null);

  const fetchBooking = async () => {
    if (!user?._id || !guideId) return;
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/booking/status/${guideId}`, { withCredentials: true });
      setBooking(res.data.booking);
    } catch {
      setBooking(null);
    }
  };

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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDayCount = getInclusiveDayCount(dates.startDate, dates.endDate);
  const selectedCostPerDay = parseDailyCost(profile?.pricing);
  const selectedTotalCost = selectedDayCount > 0 ? Number((selectedDayCount * selectedCostPerDay).toFixed(2)) : 0;
  const startDateISO = (() => {
    const parsed = parseDDMMYYYYToDate(dates.startDate);
    return parsed ? toISODate(parsed) : '';
  })();

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
                  <div className="text-xs text-green-800 dark:text-green-200 mb-3 space-y-1">
                    <p>Schedule: {formatDateDDMMYYYY(booking.startDate)} {booking.startTime || '09:00'} → {formatDateDDMMYYYY(booking.endDate)} {booking.endTime || '18:00'}</p>
                    <p>Cost: {formatMoney(booking.costPerDay, booking.currency)} / day • Total: {formatMoney(booking.totalCost, booking.currency)}</p>
                  </div>
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
                            await fetchBooking();
                            window.dispatchEvent(new CustomEvent('guide-bookings-updated'));
                          } else {
                            setBookingError(res.data.message || 'Cancel failed');
                          }
                        } catch (err) {
                          setBookingError(getApiError(err, 'Cancel failed'));
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
                    <Clock3 className="w-4 h-4" />
                    <div>
                      <p className="font-medium">Booking request sent</p>
                      <p className="text-xs text-blue-600/80 dark:text-blue-300/80">Waiting for guide approval</p>
                      <p className="text-xs text-blue-600/80 dark:text-blue-300/80 mt-1">
                        {formatDateDDMMYYYY(booking.startDate)} {booking.startTime || '09:00'} → {formatDateDDMMYYYY(booking.endDate)} {booking.endTime || '18:00'}
                      </p>
                      <p className="text-xs text-blue-600/80 dark:text-blue-300/80">
                        {formatMoney(booking.costPerDay, booking.currency)} / day • Total {formatMoney(booking.totalCost, booking.currency)}
                      </p>
                    </div>
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
                        window.dispatchEvent(new CustomEvent('guide-bookings-updated'));
                        } catch (err) {
                          setBookingError(getApiError(err, 'Cancel failed'));
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
                    if (!dates.startDate || !dates.endDate) {
                      setBookingError('Please select start and end dates.');
                      return;
                    }

                    const parsedStartDate = parseDDMMYYYYToDate(dates.startDate);
                    const parsedEndDate = parseDDMMYYYYToDate(dates.endDate);

                    if (!parsedStartDate || !parsedEndDate) {
                      setBookingError('Enter dates in dd/mm/yyyy format.');
                      return;
                    }

                    if (parsedStartDate < today) {
                      setBookingError('Start date cannot be in the past.');
                      return;
                    }

                    if (!dates.startTime || !dates.endTime) {
                      setBookingError('Please select start and end time.');
                      return;
                    }

                    if (parsedEndDate < parsedStartDate) {
                      setBookingError('End date must be on or after start date.');
                      return;
                    }

                    if (toISODate(parsedStartDate) === toISODate(parsedEndDate) && dates.endTime <= dates.startTime) {
                      setBookingError('For same-day bookings, end time must be after start time.');
                      return;
                    }

                    setBookingLoading(true);
                    setBookingError('');
                    try {
                      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/booking`, {
                        guideId: profile.user._id,
                        startDate: toISODate(parsedStartDate),
                        endDate: toISODate(parsedEndDate),
                        startTime: dates.startTime,
                        endTime: dates.endTime,
                        message: dates.message
                      }, { withCredentials: true });
                      if (res.data.success) {
                        setBooking(res.data.booking);
                        setDates({ startDate: '', endDate: '', startTime: '09:00', endTime: '18:00', message: '' });
                        setShowBookingForm(false);
                        window.dispatchEvent(new CustomEvent('guide-bookings-updated'));
                      } else {
                        setBookingError(res.data.message || 'Booking failed');
                      }
                    } catch (err) {
                      setBookingError(getApiError(err, 'Booking failed'));
                    } finally {
                      setBookingLoading(false);
                    }
                  }}>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            inputMode="numeric"
                            maxLength={10}
                            className="w-full pr-10 px-3 py-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white" 
                            required 
                            placeholder="dd/mm/yyyy"
                            value={dates.startDate} 
                            onChange={e => setDates(d => ({ ...d, startDate: normalizeDateInput(e.target.value) }))} 
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-blue-600"
                            onClick={() => {
                              const picker = startDatePickerRef.current;
                              if (!picker) return;
                              if (typeof picker.showPicker === 'function') picker.showPicker();
                              else picker.click();
                            }}
                            aria-label="Select start date"
                          >
                            <Calendar size={16} />
                          </button>
                          <input
                            ref={startDatePickerRef}
                            type="date"
                            min={toISODate(today)}
                            value={startDateISO}
                            onChange={(e) => {
                              const picked = e.target.value;
                              if (!picked) return;
                              setDates((prev) => ({ ...prev, startDate: formatDateDDMMYYYY(picked) }));
                            }}
                            className="absolute w-0 h-0 opacity-0 pointer-events-none"
                            tabIndex={-1}
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            inputMode="numeric"
                            maxLength={10}
                            className="w-full pr-10 px-3 py-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white" 
                            required 
                            placeholder="dd/mm/yyyy"
                            value={dates.endDate} 
                            onChange={e => setDates(d => ({ ...d, endDate: normalizeDateInput(e.target.value) }))} 
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-blue-600"
                            onClick={() => {
                              const picker = endDatePickerRef.current;
                              if (!picker) return;
                              if (typeof picker.showPicker === 'function') picker.showPicker();
                              else picker.click();
                            }}
                            aria-label="Select end date"
                          >
                            <Calendar size={16} />
                          </button>
                          <input
                            ref={endDatePickerRef}
                            type="date"
                            min={startDateISO || toISODate(today)}
                            value={(() => {
                              const parsed = parseDDMMYYYYToDate(dates.endDate);
                              return parsed ? toISODate(parsed) : '';
                            })()}
                            onChange={(e) => {
                              const picked = e.target.value;
                              if (!picked) return;
                              setDates((prev) => ({ ...prev, endDate: formatDateDDMMYYYY(picked) }));
                            }}
                            className="absolute w-0 h-0 opacity-0 pointer-events-none"
                            tabIndex={-1}
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                        <input
                          type="time"
                          className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                          required
                          value={dates.startTime}
                          onChange={e => setDates(d => ({ ...d, startTime: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
                        <input
                          type="time"
                          className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                          required
                          value={dates.endTime}
                          onChange={e => setDates(d => ({ ...d, endTime: e.target.value }))}
                        />
                      </div>
                    </div>
                    {(dates.startDate && dates.endDate) && (
                      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm">
                        <p className="text-blue-700 dark:text-blue-300 font-medium">
                          Selected: {formatDateDDMMYYYY(dates.startDate)} → {formatDateDDMMYYYY(dates.endDate)} ({selectedDayCount} day{selectedDayCount === 1 ? '' : 's'})
                        </p>
                        <p className="text-blue-700 dark:text-blue-300 mt-1">
                          Cost Preview: {formatMoney(selectedCostPerDay, 'INR')} / day • Total {formatMoney(selectedTotalCost, 'INR')}
                        </p>
                      </div>
                    )}
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
