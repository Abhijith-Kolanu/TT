import React, { useState } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { UserPlus, Globe, Briefcase, MapPin, IndianRupee, FileText, Loader2, X, Check } from 'lucide-react';

const LANGUAGES = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Mandarin', 'Other'];
const EXPERTISE = ['Trekking', 'City Tours', 'Wildlife', 'Cultural', 'Adventure', 'Food', 'Other'];

const GuideRegistrationForm = ({ profile, onSuccess, onCancel }) => {
  const [form, setForm] = useState({
    bio: profile?.bio || '',
    languages: profile?.languages || [],
    expertise: profile?.expertise || [],
    locations: profile?.locations?.join(', ') || '',
    pricing: profile?.pricing || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const toggleSelection = (field, value) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter(v => v !== value)
        : [...f[field], value]
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...form,
        locations: form.locations.split(',').map(s => s.trim()).filter(Boolean),
      };
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/guide/profile`, payload, { withCredentials: true });
      if (res.data.success) {
        setSuccess('Profile saved successfully!');
        setTimeout(() => {
          onSuccess && onSuccess(res.data.profile);
        }, 1000);
      } else {
        setError('Failed to save profile.');
      }
    } catch (err) {
      setError('Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {profile ? 'Edit Guide Profile' : 'Become a Guide'}
          </h2>
        </div>
        {onCancel && (
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Form */}
      <form className="p-6 space-y-5" onSubmit={handleSubmit}>
        {/* Bio */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FileText className="w-4 h-4" />
            About You
          </label>
          <textarea 
            name="bio" 
            value={form.bio} 
            onChange={handleChange} 
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400 resize-none" 
            rows={3} 
            required 
            placeholder="Tell travellers about yourself and your experience as a guide..." 
          />
        </div>

        {/* Languages */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Globe className="w-4 h-4" />
            Languages Spoken
          </label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => toggleSelection('languages', lang)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  form.languages.includes(lang)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {form.languages.includes(lang) && <Check className="w-3 h-3 inline mr-1" />}
                {lang}
              </button>
            ))}
          </div>
          {form.languages.length === 0 && (
            <p className="text-xs text-gray-400 mt-1">Select at least one language</p>
          )}
        </div>

        {/* Expertise */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Briefcase className="w-4 h-4" />
            Expertise Areas
          </label>
          <div className="flex flex-wrap gap-2">
            {EXPERTISE.map(exp => (
              <button
                key={exp}
                type="button"
                onClick={() => toggleSelection('expertise', exp)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  form.expertise.includes(exp)
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {form.expertise.includes(exp) && <Check className="w-3 h-3 inline mr-1" />}
                {exp}
              </button>
            ))}
          </div>
          {form.expertise.length === 0 && (
            <p className="text-xs text-gray-400 mt-1">Select at least one expertise</p>
          )}
        </div>

        {/* Locations */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <MapPin className="w-4 h-4" />
            Locations You Guide
          </label>
          <input 
            name="locations" 
            value={form.locations} 
            onChange={handleChange} 
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400" 
            required 
            placeholder="e.g. Manali, Ladakh, Goa (comma separated)" 
          />
        </div>

        {/* Pricing */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <IndianRupee className="w-4 h-4" />
            Daily Rate (INR)
          </label>
          <input 
            name="pricing" 
            type="number" 
            min="0" 
            value={form.pricing} 
            onChange={handleChange} 
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400" 
            required 
            placeholder="e.g. 2000" 
          />
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
            <Check className="w-4 h-4" />
            {success}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3 pt-2">
          <Button 
            type="submit" 
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3"
            disabled={loading || form.languages.length === 0 || form.expertise.length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </Button>
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              className="px-6 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default GuideRegistrationForm;
