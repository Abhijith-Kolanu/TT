import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from './ui/button';

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

  if (loading) return <div>Loading booking requests...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (requests.length === 0) return <div className="text-gray-500">No pending booking requests.</div>;

  return (
    <div className="guide-booking-requests p-4 border rounded mb-6">
      <h2 className="text-lg font-bold mb-4">Booking Requests</h2>
      <ul className="space-y-4">
        {requests.map(req => (
          <li key={req._id} className="p-4 border rounded flex items-center justify-between">
            <div>
              <div className="font-semibold">{req.traveller.username}</div>
              <div className="text-xs text-gray-400">{new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}</div>
              <div className="text-sm text-gray-700">{req.message}</div>
            </div>
            <div className="flex gap-2">
              <Button disabled={actionLoading === req._id + 'accepted'} onClick={() => handleAction(req._id, 'accepted')}>Accept</Button>
              <Button variant="outline" disabled={actionLoading === req._id + 'rejected'} onClick={() => handleAction(req._id, 'rejected')}>Reject</Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GuideBookingRequests;
