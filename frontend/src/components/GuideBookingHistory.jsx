import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Clock3, Inbox, Loader2, History as HistoryIcon } from 'lucide-react';

const formatDateDDMMYYYY = (value) => {
  if (!value) return '--/--/----';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--/--/----';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatMoney = (value, currency = 'INR') => {
  const amount = Number(value || 0);
  return `${currency} ${amount.toLocaleString('en-IN')}`;
};

const GuideBookingHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/booking`, { withCredentials: true });
      const asTraveller = (res.data?.asTraveller || []).map((item) => ({ ...item, role: 'traveller' }));
      const asGuide = (res.data?.asGuide || []).map((item) => ({ ...item, role: 'guide' }));

      const all = [...asTraveller, ...asGuide]
        .filter((item) => ['rejected', 'cancelled', 'withdrawn'].includes(item.status))
        .sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate));

      setHistory(all);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load booking history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getStatusClass = (status) => {
    if (status === 'rejected') return 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300';
    if (status === 'cancelled') return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    if (status === 'withdrawn') return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300';
    return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-500 dark:text-gray-400 text-sm">Loading history...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-6 text-red-500 text-sm">{error}</div>;
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <Inbox className="w-7 h-7 text-gray-400" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
          <HistoryIcon className="w-4 h-4 text-blue-600 dark:text-blue-300" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Booking History</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Rejected, cancelled, and withdrawn records</p>
        </div>
        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">
          {history.length}
        </span>
      </div>

      {history.map((item) => {
        const counterpartName = item.role === 'guide'
          ? item?.traveller?.username || 'Traveller'
          : item?.guide?.username || 'Guide';

        return (
          <div key={`${item._id}-${item.role}`} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {item.role === 'guide' ? `Traveller: ${counterpartName}` : `Guide: ${counterpartName}`}
              </p>
              <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusClass(item.status)}`}>
                {item.status}
              </span>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatDateDDMMYYYY(item.startDate)} {item.startTime || '09:00'} - {formatDateDDMMYYYY(item.endDate)} {item.endTime || '18:00'}
            </p>

            <p className="text-xs text-gray-700 dark:text-gray-200 font-medium mt-1">
              {formatMoney(item.costPerDay, item.currency)} / day • Total {formatMoney(item.totalCost, item.currency)}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default GuideBookingHistory;
