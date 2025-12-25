import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { getUserInitials } from '@/lib/utils';
import { Calendar, MessageSquare, Check, X, Loader2, Inbox } from 'lucide-react';

const GuideBookingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/booking`, { withCredentials: true });
        setRequests(res.data.asGuide.filter(b => b.status === 'pending'));
      } catch (err) {
        setError('Failed to load booking requests.');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleAction = async (bookingId, status) => {
    setActionLoading(bookingId + status);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/v1/booking/${bookingId}`, { status }, { withCredentials: true });
      setRequests(reqs => reqs.filter(r => r._id !== bookingId));
    } catch {
      // Optionally show error
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-500 dark:text-gray-400 text-sm">Loading requests...</span>
      </div>
    );
  }
  
  if (error) return <div className="text-center py-6 text-red-500 text-sm">{error}</div>;
  
  if (requests.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <Inbox className="w-7 h-7 text-gray-400" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No pending booking requests</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Calendar className="w-5 h-5 text-blue-500" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Booking Requests</h2>
        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">
          {requests.length}
        </span>
      </div>
      
      <div className="space-y-3">
        {requests.map(req => (
          <div key={req._id} className="p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl">
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
                  {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
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
    </div>
  );
};

export default GuideBookingRequests;
