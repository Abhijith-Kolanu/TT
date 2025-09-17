import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { getUserInitials } from '@/lib/utils';

const AssignedGuide = () => {
  const { user } = useSelector(store => store.auth);
  const [assigned, setAssigned] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssigned = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/booking`, { withCredentials: true });
        // Find accepted booking as traveller
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
    <div className="p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-600/30 shadow-xl mb-8">
      <div className="font-semibold mb-2 text-lg text-blue-700 dark:text-blue-300">Assigned Guide</div>
      <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16 ring-4 ring-white dark:ring-gray-700 shadow-xl duration-300">
          <AvatarImage src={assigned.guide.profilePicture} alt="guide_image" />
          <AvatarFallback className="bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 text-white font-bold text-xl">
            {getUserInitials(assigned.guide.username)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-bold text-lg">{assigned.guide.username}</div>
          <div className="text-gray-500">{assigned.startDate && assigned.endDate ? `${new Date(assigned.startDate).toLocaleDateString()} - ${new Date(assigned.endDate).toLocaleDateString()}` : ''}</div>
          <div className="text-xs text-gray-400">Booking accepted</div>
        </div>
      </div>
    </div>
  );
};

export default AssignedGuide;
