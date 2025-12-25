import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { getUserInitials } from '@/lib/utils';
import { setSelectedUser } from '@/redux/authSlice';
import { UserCheck, Calendar, MessageCircle } from 'lucide-react';

const AssignedGuide = () => {
  const { user } = useSelector(store => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [assigned, setAssigned] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssigned = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/booking`, { withCredentials: true });
        const accepted = (res.data.asTraveller || []).find(b => b.status === 'accepted');
        setAssigned(accepted || null);
      } catch {
        setAssigned(null);
      } finally {
        setLoading(false);
      }
    };
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
                ? `${new Date(assigned.startDate).toLocaleDateString()} - ${new Date(assigned.endDate).toLocaleDateString()}` 
                : 'Dates not set'}
            </div>
          </div>
        </div>
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
      </div>
    </div>
  );
};

export default AssignedGuide;
