import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { getUserInitials } from '@/lib/utils';
import { Search, MapPin, Globe, Briefcase, IndianRupee, Star, Loader2 } from 'lucide-react';

const GuideSearch = ({ onSelectGuide }) => {
  const { user } = useSelector(store => store.auth);
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
        // Filter out the current user's profile
        const filteredGuides = (res.data.guides || []).filter(guide => guide.user._id !== user?._id);
        setGuides(filteredGuides);
      } catch (err) {
        setError('Failed to load guides.');
      } finally {
        setLoading(false);
      }
    };
    fetchGuides();
  }, [filters, user]);

  return (
    <div className="space-y-5">
      {/* Search Header */}
      <div className="flex items-center gap-2 mb-2">
        <Search className="w-5 h-5 text-blue-500" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Find a Guide</h2>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            placeholder="Location (e.g. Goa)" 
            value={filters.location} 
            onChange={e => setFilters(f => ({ ...f, location: e.target.value }))} 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select 
            value={filters.language} 
            onChange={e => setFilters(f => ({ ...f, language: e.target.value }))} 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white appearance-none cursor-pointer"
          >
            <option value="">All Languages</option>
            {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
          </select>
        </div>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select 
            value={filters.expertise} 
            onChange={e => setFilters(f => ({ ...f, expertise: e.target.value }))} 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white appearance-none cursor-pointer"
          >
            <option value="">All Expertise</option>
            {EXPERTISE.map(exp => <option key={exp} value={exp}>{exp}</option>)}
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-500 dark:text-gray-400">Loading guides...</span>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : guides.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">No guides found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {guides.map(guide => (
            <div 
              key={guide._id} 
              className="p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-200 group"
              onClick={() => onSelectGuide(guide)}
            >
              <div className="flex items-start gap-4">
                <Avatar className="w-14 h-14 ring-2 ring-white dark:ring-gray-600 shadow-md flex-shrink-0">
                  <AvatarImage src={guide.user.profilePicture} alt="avatar" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                    {getUserInitials(guide.user.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {guide.user.username}
                    </h3>
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold text-sm flex-shrink-0">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {guide.pricing}/day
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {guide.locations.slice(0, 2).join(', ')}{guide.locations.length > 2 && '...'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {guide.languages.slice(0, 2).join(', ')}{guide.languages.length > 2 && '...'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1 mb-2">{guide.bio}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {guide.expertise.slice(0, 3).map(exp => (
                      <span key={exp} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                        {exp}
                      </span>
                    ))}
                    {guide.expertise.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                        +{guide.expertise.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuideSearch;
