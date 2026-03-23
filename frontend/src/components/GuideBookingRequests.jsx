import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { getUserInitials } from '@/lib/utils';
import { Calendar, MessageSquare, Check, X, Loader2, Inbox, ClipboardCheck } from 'lucide-react';

const formatMoney = (value, currency = 'INR') => {
  const amount = Number(value || 0);
  return `${currency} ${amount.toLocaleString('en-IN')}`;
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
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diff = end - start;
  if (Number.isNaN(diff) || diff < 0) return 0;
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
};

const formatDateDDMMYYYY = (value) => {
  if (!value) return '--/--/----';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--/--/----';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const isFutureOrOngoingBooking = (endDate) => {
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return end.getTime() >= Date.now();
};

const canCancelBeforeTwoDays = (startDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const cutoff = new Date(start);
  cutoff.setDate(cutoff.getDate() - 2);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now <= cutoff;
};

const GuideBookingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [ownCostPerDay, setOwnCostPerDay] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [conflictInfo, setConflictInfo] = useState(null);
  const [actionLoading, setActionLoading] = useState('');
  const [cancelConflictLoadingId, setCancelConflictLoadingId] = useState('');
  const [activeCancelLoadingId, setActiveCancelLoadingId] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    setConflictInfo(null);
    try {
      const [bookingRes, guideRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/v1/booking`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/v1/guide/me`, { withCredentials: true }).catch(() => null)
      ]);

      const ownPricing = parseDailyCost(guideRes?.data?.profile?.pricing);
      setOwnCostPerDay(ownPricing);

      const res = bookingRes;
      const asGuide = res.data.asGuide || [];
      setAllBookings(asGuide);
      setRequests(asGuide.filter(b => b.status === 'pending'));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load booking requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (bookingId, status) => {
    setActionLoading(bookingId + status);
    setError('');
    setConflictInfo(null);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/v1/booking/${bookingId}`, { status }, { withCredentials: true });
      await fetchRequests();
      window.dispatchEvent(new CustomEvent('guide-bookings-updated'));
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to update booking request.';
      setError(message);
      if (err?.response?.status === 409 && err?.response?.data?.conflict) {
        setConflictInfo(err.response.data.conflict);
      }
    } finally {
      setActionLoading('');
    }
  };

  const handleCancelConflictingAccepted = async (bookingId) => {
    if (!window.confirm('Cancel this accepted booking to free the slot?')) return;

    setCancelConflictLoadingId(String(bookingId));
    setError('');
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/v1/booking/${bookingId}`, { status: 'cancelled' }, { withCredentials: true });
      await fetchRequests();
      window.dispatchEvent(new CustomEvent('guide-bookings-updated'));
      setError('Accepted booking cancelled. You can now accept the pending request.');
      setConflictInfo(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to cancel accepted booking.');
    } finally {
      setCancelConflictLoadingId('');
    }
  };

  const handleCancelActiveAccepted = async (bookingId) => {
    if (!window.confirm('Cancel this accepted booking?')) return;

    setActiveCancelLoadingId(String(bookingId));
    setError('');
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/v1/booking/${bookingId}`, { status: 'cancelled' }, { withCredentials: true });
      await fetchRequests();
      window.dispatchEvent(new CustomEvent('guide-bookings-updated'));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to cancel accepted booking.');
    } finally {
      setActiveCancelLoadingId('');
    }
  };

  const activeAcceptedBookings = allBookings.filter((booking) => booking.status === 'accepted' && isFutureOrOngoingBooking(booking.endDate));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-500 dark:text-gray-400 text-sm">Loading requests...</span>
      </div>
    );
  }
  
  if (error && !conflictInfo) return (
    <div className="text-center py-6">
      <div className="text-red-500 text-sm mb-3">{error}</div>
      <Button size="sm" variant="outline" onClick={fetchRequests}>Retry</Button>
    </div>
  );
  
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
          <ClipboardCheck className="w-4 h-4 text-blue-600 dark:text-blue-300" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Incoming Requests to Me</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Review, accept, and manage booking requests</p>
        </div>
        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">
          {requests.length}
        </span>
      </div>

      {conflictInfo && (
        <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">Time conflict found</p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">You already have an accepted booking in the same time window. Compare details below and cancel accepted one first if needed.</p>

          {conflictInfo.currentRequest && (
            <div className="mb-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700">
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 mb-1">Requested booking you tried to accept</p>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {formatDateDDMMYYYY(conflictInfo.currentRequest.startDate)} {conflictInfo.currentRequest.startTime} - {formatDateDDMMYYYY(conflictInfo.currentRequest.endDate)} {conflictInfo.currentRequest.endTime}
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-200 font-medium mt-1">
                {formatMoney(conflictInfo.currentRequest.costPerDay, conflictInfo.currentRequest.currency)} / day • Total {formatMoney(conflictInfo.currentRequest.totalCost, conflictInfo.currentRequest.currency)}
              </p>
            </div>
          )}

          <div className="space-y-2">
            {(conflictInfo.conflictingAccepted || []).map((item) => (
              <div key={item.bookingId} className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700">
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 mb-1">Accepted booking: {item.travellerName}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {formatDateDDMMYYYY(item.startDate)} {item.startTime} - {formatDateDDMMYYYY(item.endDate)} {item.endTime}
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-200 font-medium mt-1">
                  {formatMoney(item.costPerDay, item.currency)} / day • Total {formatMoney(item.totalCost, item.currency)}
                </p>
                <div className="mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    disabled={cancelConflictLoadingId === String(item.bookingId)}
                    onClick={() => handleCancelConflictingAccepted(item.bookingId)}
                  >
                    {cancelConflictLoadingId === String(item.bookingId)
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : 'Cancel this accepted booking'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 rounded-xl border border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-green-800 dark:text-green-200">Requests Accepted by Me</p>
          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 text-xs rounded-full font-medium">
            {activeAcceptedBookings.length}
          </span>
        </div>

        {activeAcceptedBookings.length === 0 ? (
          <p className="text-xs text-green-700/80 dark:text-green-300/80">No active accepted bookings.</p>
        ) : (
          <div className="space-y-2">
            {activeAcceptedBookings.map((booking) => {
              const costPerDay = ownCostPerDay > 0 ? ownCostPerDay : Number(booking.costPerDay || 0);
              const dayCount = getInclusiveDayCount(booking.startDate, booking.endDate);
              const totalCost = costPerDay * dayCount;
              const canCancel = canCancelBeforeTwoDays(booking.startDate);

              return (
                <div key={booking._id} className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 shadow-sm">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 mb-1">{booking?.traveller?.username || 'Traveller'}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {formatDateDDMMYYYY(booking.startDate)} {booking.startTime || '09:00'} - {formatDateDDMMYYYY(booking.endDate)} {booking.endTime || '18:00'}
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-200 font-medium mt-1">
                    {formatMoney(costPerDay, booking.currency)} / day • Total {formatMoney(totalCost, booking.currency)}
                  </p>
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      disabled={!canCancel || activeCancelLoadingId === String(booking._id)}
                      onClick={() => handleCancelActiveAccepted(booking._id)}
                      title={canCancel ? 'Cancel accepted booking' : 'Can be cancelled only until 2 days before start date'}
                    >
                      {activeCancelLoadingId === String(booking._id)
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : 'Cancel booking'}
                    </Button>
                    {!canCancel && (
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1">
                        Cancellation allowed only until 2 days before start date.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {requests.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-14 h-14 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Inbox className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">No pending booking requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => (
            <div key={req._id} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10 ring-2 ring-white dark:ring-gray-600 shadow-sm flex-shrink-0">
                  <AvatarImage src={req.traveller.profilePicture} alt="traveller" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm">
                    {getUserInitials(req.traveller.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{req.traveller.username}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {formatDateDDMMYYYY(req.startDate)} - {formatDateDDMMYYYY(req.endDate)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Time: {req.startTime || '09:00'} - {req.endTime || '18:00'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 font-medium">
                    {(() => {
                      const costPerDay = ownCostPerDay > 0 ? ownCostPerDay : Number(req.costPerDay || 0);
                      const dayCount = getInclusiveDayCount(req.startDate, req.endDate);
                      const totalCost = costPerDay * dayCount;
                      return `${formatMoney(costPerDay, req.currency)} / day • Total ${formatMoney(totalCost, req.currency)}`;
                    })()}
                  </div>
                  {req.message && (
                    <div className="flex items-start gap-1.5 mt-2">
                      <MessageSquare className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{req.message}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                <Button 
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                  disabled={actionLoading === req._id + 'accepted'} 
                  onClick={() => handleAction(req._id, 'accepted')}
                >
                  {actionLoading === req._id + 'accepted' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Accept
                    </>
                  )}
                </Button>
                <Button 
                  size="sm"
                  variant="outline" 
                  className="flex-1 border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  disabled={actionLoading === req._id + 'rejected'} 
                  onClick={() => handleAction(req._id, 'rejected')}
                >
                  {actionLoading === req._id + 'rejected' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <X className="w-4 h-4 mr-1" />
                      Decline
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default GuideBookingRequests;
