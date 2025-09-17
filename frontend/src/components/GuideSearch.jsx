import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { getUserInitials } from '@/lib/utils';

const GuideSearch = ({ onSelectGuide }) => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ location: '', language: '', expertise: '' });
  const LANGUAGES = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Mandarin', 'Other'];
  const EXPERTISE = ['Trekking', 'City Tours', 'Wildlife', 'Cultural', 'Adventure', 'Food', 'Other'];

  useEffect(() => {
    const fetchGuides = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (filters.location) params.location = filters.location;
        if (filters.language) params.language = filters.language;
        if (filters.expertise) params.expertise = filters.expertise;
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/guide`, { params });
        setGuides(res.data.guides || []);
      } catch (err) {
        setError('Failed to load guides.');
      } finally {
        setLoading(false);
      }
    };
    fetchGuides();
  }, [filters]);

  return (
    <div className="guide-search">
      <h2 className="text-xl font-bold mb-4">Find a Guide</h2>
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <input placeholder="Location (e.g. Goa)" value={filters.location} onChange={e => setFilters(f => ({ ...f, location: e.target.value }))} className="input" />
        <select value={filters.language} onChange={e => setFilters(f => ({ ...f, language: e.target.value }))} className="input">
          <option value="">All Languages</option>
          {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
        </select>
        <select value={filters.expertise} onChange={e => setFilters(f => ({ ...f, expertise: e.target.value }))} className="input">
          <option value="">All Expertise</option>
          {EXPERTISE.map(exp => <option key={exp} value={exp}>{exp}</option>)}
        </select>
      </div>
      {loading ? <div>Loading...</div> : error ? <div className="text-red-500">{error}</div> : (
        <ul className="space-y-4">
          {guides.map(guide => (
            <li key={guide._id} className="p-4 border rounded cursor-pointer hover:bg-blue-50" onClick={() => onSelectGuide(guide)}>
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 ring-2 ring-white dark:ring-gray-700 shadow-md">
                  <AvatarImage src={guide.user.profilePicture} alt="avatar" />
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 text-white font-bold text-lg">
                    {getUserInitials(guide.user.username)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{guide.user.username}</div>
                  <div className="text-xs text-gray-400 mb-1">{guide.locations.join(', ')} | {guide.languages.join(', ')}</div>
                  <div className="text-sm text-gray-700 mb-1 line-clamp-2">{guide.bio}</div>
                  <div className="text-xs text-blue-600">Expertise: {guide.expertise.join(', ')}</div>
                  <div className="text-xs text-green-700">₹{guide.pricing}/day</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GuideSearch;
