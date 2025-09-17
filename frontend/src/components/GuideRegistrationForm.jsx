import React, { useState } from 'react';
import axios from 'axios';
const LANGUAGES = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Mandarin', 'Other'];
const EXPERTISE = ['Trekking', 'City Tours', 'Wildlife', 'Cultural', 'Adventure', 'Food', 'Other'];

const GuideRegistrationForm = ({ profile, onSuccess }) => {
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
    const { name, value, type, selectedOptions } = e.target;
    if (type === 'select-multiple') {
      setForm(f => ({ ...f, [name]: Array.from(selectedOptions, o => o.value) }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
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
        setSuccess('Profile saved!');
        onSuccess && onSuccess(res.data.profile);
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
    <form className="guide-registration-form p-4 border rounded mb-6 bg-white dark:bg-gray-900" onSubmit={handleSubmit}>
      <h2 className="text-lg font-bold mb-2">{profile ? 'Edit Guide Profile' : 'Become a Guide'}</h2>
      <div className="mb-2">
        <label className="block text-sm font-medium">Short Bio</label>
        <textarea name="bio" value={form.bio} onChange={handleChange} className="input w-full" rows={2} required placeholder="Tell travellers about yourself and your experience" />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium">Languages Spoken</label>
        <select name="languages" multiple value={form.languages} onChange={handleChange} className="input w-full" required>
          {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
        </select>
        <span className="text-xs text-gray-400">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</span>
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium">Expertise</label>
        <select name="expertise" multiple value={form.expertise} onChange={handleChange} className="input w-full" required>
          {EXPERTISE.map(exp => <option key={exp} value={exp}>{exp}</option>)}
        </select>
        <span className="text-xs text-gray-400">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</span>
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium">Locations (comma separated)</label>
        <input name="locations" value={form.locations} onChange={handleChange} className="input w-full" required placeholder="e.g. Manali, Ladakh, Goa" />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium">Pricing (per day in INR)</label>
        <input name="pricing" type="number" min="0" value={form.pricing} onChange={handleChange} className="input w-full" required placeholder="e.g. 2000" />
      </div>
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      {success && <div className="text-green-600 text-sm mb-2">{success}</div>}
      <button type="submit" className="btn-adventure px-6 py-2 rounded" disabled={loading}>{loading ? 'Saving...' : 'Save Profile'}</button>
    </form>
  );
};

export default GuideRegistrationForm;
