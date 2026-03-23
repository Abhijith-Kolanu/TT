import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { getUserInitials } from '@/lib/utils';
import { setSelectedUser } from '@/redux/authSlice';
import { UserCheck, Calendar, MessageCircle, Loader2, X } from 'lucide-react';

const formatDateDDMMYYYY = (value) => {
  if (!value) return '--/--/----';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--/--/----';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const AssignedGuide = () => {
  const { user } = useSelector(store => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [assigned, setAssigned] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  const fetchAssigned = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/booking`, { withCredentials: true });
      const accepted = (res.data.asTraveller || []).find(b => b.status === 'accepted');
      setAssigned(accepted || null);
    } catch (err) {
      setAssigned(null);
      setError(err?.response?.data?.message || 'Unable to load assigned guide.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssigned();
  }, [user]);

  if (loading) return null;
  if (!assigned) return null;

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-5 border border-green-200 dark:border-green-800 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-green-500 rounded-lg">
          <UserCheck className="w-4 h-4 text-white" />
        </div>
        <h2 className="font-semibold text-green-800 dark:text-green-300">Your Assigned Guide</h2>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="w-14 h-14 ring-2 ring-white dark:ring-gray-700 shadow-md">
            <AvatarImage src={assigned.guide.profilePicture} alt="guide" />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
              {getUserInitials(assigned.guide.username)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{assigned.guide.username}</h3>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              {assigned.startDate && assigned.endDate 
                ? `${formatDateDDMMYYYY(assigned.startDate)} - ${formatDateDDMMYYYY(assigned.endDate)}` 
                : 'Dates not set'}
            </div>
          </div>
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <Button 
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            onClick={() => {
              dispatch(setSelectedUser(assigned.guide));
              navigate('/chat', { state: { selectedUser: assigned.guide } });
            }}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
          <Button
            variant="outline"
            className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            disabled={cancelling}
            onClick={async () => {
              if (!window.confirm('Are you sure you want to cancel your assigned guide booking?')) return;
              setCancelling(true);
              setError('');
              try {
                await axios.put(
                  `${import.meta.env.VITE_API_URL}/api/v1/booking/${assigned._id}`,
                  { status: 'cancelled' },
                  { withCredentials: true }
                );
                setAssigned(null);
              } catch (err) {
                setError(err?.response?.data?.message || 'Failed to cancel assigned guide booking.');
              } finally {
                setCancelling(false);
              }
            }}
          >
            {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4 mr-1" />}
            {cancelling ? 'Cancelling...' : 'Cancel'}
          </Button>
        </div>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400 mt-3">{error}</p>}
    </div>
  );
};

export default AssignedGuide;
