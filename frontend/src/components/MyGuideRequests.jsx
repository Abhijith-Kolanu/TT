import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { getUserInitials } from '@/lib/utils';
import { Calendar, Inbox, Loader2, X, Send, CheckCircle2 } from 'lucide-react';

const formatMoney = (value, currency = 'INR') => {
  const amount = Number(value || 0);
  return `${currency} ${amount.toLocaleString('en-IN')}`;
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

const MyGuideRequests = ({ onOpenGuide }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/booking`, { withCredentials: true });
      setRequests(res.data?.asTraveller || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load your guide requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getStatusClass = (status) => {
    if (status === 'accepted') return 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300';
    if (status === 'pending') return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300';
    if (status === 'rejected') return 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300';
    if (status === 'cancelled') return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  const canCancel = (status) => status === 'pending' || status === 'accepted';

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this guide request?')) return;
    setActionLoading(bookingId);
    setError('');
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/v1/booking/${bookingId}`, { status: 'cancelled' }, { withCredentials: true });
      await fetchRequests();
      window.dispatchEvent(new CustomEvent('guide-bookings-updated'));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to cancel request.');
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-500 dark:text-gray-400 text-sm">Loading your requests...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <div className="text-red-500 text-sm mb-3">{error}</div>
        <Button size="sm" variant="outline" onClick={fetchRequests}>Retry</Button>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <Inbox className="w-7 h-7 text-gray-400" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No guide requests sent yet</p>
      </div>
    );
  }

  const acceptedRequest = requests.find((request) => request.status === 'accepted');
  const outgoingRequests = requests.filter((request) => request._id !== acceptedRequest?._id);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
          <Send className="w-4 h-4 text-blue-600 dark:text-blue-300" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Requests</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Track accepted and outgoing guide requests</p>
        </div>
      </div>

      {acceptedRequest && (
        <div className="p-4 rounded-xl border border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <p className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Guide Who Accepted Your Request
          </p>
          <div className="p-3.5 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 rounded-lg shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => acceptedRequest?.guide?._id && onOpenGuide?.(acceptedRequest.guide._id)}
                className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-300 transition-colors truncate"
              >
                {acceptedRequest?.guide?.username || 'Guide'}
              </button>
              <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                accepted
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatDateDDMMYYYY(acceptedRequest.startDate)} - {formatDateDDMMYYYY(acceptedRequest.endDate)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Time: {acceptedRequest.startTime || '09:00'} - {acceptedRequest.endTime || '18:00'}
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-200 font-medium mt-1">
              {formatMoney(acceptedRequest.costPerDay, acceptedRequest.currency)} / day • Total {formatMoney(acceptedRequest.totalCost, acceptedRequest.currency)}
            </p>

            <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
              <Button
                size="sm"
                variant="outline"
                className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                disabled={actionLoading === acceptedRequest._id}
                onClick={() => handleCancel(acceptedRequest._id)}
              >
                {actionLoading === acceptedRequest._id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <X className="w-4 h-4 mr-1" />
                    Cancel Booking
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Outgoing Requests to Other Guides</p>
        {outgoingRequests.length === 0 ? (
          <div className="p-5 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30 text-sm text-gray-500 dark:text-gray-400">
            No outgoing requests to other guides.
          </div>
        ) : (
          <div className="space-y-3">
            {outgoingRequests.map((request) => (
        <div key={request._id} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10 ring-2 ring-white dark:ring-gray-600 shadow-sm flex-shrink-0">
              <AvatarImage src={request?.guide?.profilePicture} alt="guide" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm">
                {getUserInitials(request?.guide?.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => request?.guide?._id && onOpenGuide?.(request.guide._id)}
                  className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-300 transition-colors truncate"
                >
                  {request?.guide?.username || 'Guide'}
                </button>
                <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusClass(request.status)}`}>
                  {request.status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                <Calendar className="w-3 h-3" />
                {formatDateDDMMYYYY(request.startDate)} - {formatDateDDMMYYYY(request.endDate)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Time: {request.startTime || '09:00'} - {request.endTime || '18:00'}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mt-1">
                {formatMoney(request.costPerDay, request.currency)} / day • Total {formatMoney(request.totalCost, request.currency)}
              </p>
              {request.message && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{request.message}</p>
              )}
            </div>
          </div>

          {canCancel(request.status) && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <Button
                size="sm"
                variant="outline"
                className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                disabled={actionLoading === request._id}
                onClick={() => handleCancel(request._id)}
              >
                {actionLoading === request._id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <X className="w-4 h-4 mr-1" />
                    Cancel Request
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGuideRequests;
