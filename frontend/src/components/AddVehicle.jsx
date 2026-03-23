import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Car } from 'lucide-react';

const VEHICLE_TYPES = ['car', 'bike', 'suv', 'scooter', 'bicycle', 'atv', 'jeep'];
const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'cng', 'hybrid'];
const TRANSMISSION = ['manual', 'automatic'];

const AddVehicle = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [previews, setPreviews] = useState([]);
    const [form, setForm] = useState({
        title: '',
        type: 'car',
        brand: '',
        model: '',
        year: '',
        description: '',
        location: '',
        pricePerDay: '',
        features: '',
        seats: '',
        fuelType: 'petrol',
        transmission: 'manual',
    });
    const [images, setImages] = useState([]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImages = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }
        setImages(prev => [...prev, ...files]);
        const newPreviews = files.map(f => URL.createObjectURL(f));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.brand || !form.model || !form.year || !form.location || !form.pricePerDay) {
            return toast.error('Please fill all required fields');
        }

        try {
            setLoading(true);
            const data = new FormData();
            Object.entries(form).forEach(([k, v]) => data.append(k, v));
            images.forEach(img => data.append('images', img));

            await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/vehicle`, data, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            toast.success('Vehicle listed successfully!');
            navigate('/vehicle-rentals');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to list vehicle');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='min-h-screen bg-gray-50 dark:bg-gray-900 pb-10'>
            {/* Top bar */}
            <div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4'>
                <div className='max-w-2xl mx-auto flex items-center gap-3'>
                    <button onClick={() => navigate('/vehicle-rentals')} className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'>
                        <ArrowLeft className='w-5 h-5 text-gray-600 dark:text-gray-300' />
                    </button>
                    <div>
                        <h1 className='text-xl font-bold text-gray-900 dark:text-white'>List Your Vehicle</h1>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>Earn from your vehicle during your travels</p>
                    </div>
                </div>
            </div>

            <div className='max-w-2xl mx-auto px-6 mt-6'>
                <form onSubmit={handleSubmit} className='space-y-6'>

                    {/* Image Upload */}
                    <div className='bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm'>
                        <h2 className='font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2'>
                            <Upload className='w-4 h-4 text-blue-500' /> Vehicle Photos
                            <span className='text-xs text-gray-400 font-normal'>(up to 5)</span>
                        </h2>
                        <div className='flex flex-wrap gap-3'>
                            {previews.map((src, i) => (
                                <div key={i} className='relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600'>
                                    <img src={src} alt='' className='w-full h-full object-cover' />
                                    <button
                                        type='button'
                                        onClick={() => removeImage(i)}
                                        className='absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs transition-colors'
                                    >
                                        <X className='w-3 h-3' />
                                    </button>
                                </div>
                            ))}
                            {previews.length < 5 && (
                                <label className='w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-700/50'>
                                    <Car className='w-6 h-6 text-gray-400' />
                                    <span className='text-xs text-gray-400 mt-1'>Add photo</span>
                                    <input type='file' accept='image/*' multiple className='hidden' onChange={handleImages} />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className='bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4'>
                        <h2 className='font-semibold text-gray-800 dark:text-white'>Basic Information</h2>

                        <div>
                            <label className='label-style'>Listing Title *</label>
                            <input name='title' value={form.title} onChange={handleChange}
                                placeholder='e.g. Royal Enfield Himalayan – Adventure Ready'
                                className='input-style' required />
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <label className='label-style'>Vehicle Type *</label>
                                <select name='type' value={form.type} onChange={handleChange} className='input-style'>
                                    {VEHICLE_TYPES.map(t => <option key={t} value={t} className='capitalize'>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className='label-style'>Brand *</label>
                                <input name='brand' value={form.brand} onChange={handleChange} placeholder='e.g. Royal Enfield' className='input-style' required />
                            </div>
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <label className='label-style'>Model *</label>
                                <input name='model' value={form.model} onChange={handleChange} placeholder='e.g. Himalayan' className='input-style' required />
                            </div>
                            <div>
                                <label className='label-style'>Year *</label>
                                <input name='year' type='number' min='2000' max='2026' value={form.year} onChange={handleChange} placeholder='e.g. 2022' className='input-style' required />
                            </div>
                        </div>

                        <div>
                            <label className='label-style'>Description</label>
                            <textarea name='description' value={form.description} onChange={handleChange}
                                rows={3} placeholder='Describe your vehicle, condition, what makes it great for adventures…'
                                className='input-style resize-none' />
                        </div>
                    </div>

                    {/* Specs */}
                    <div className='bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4'>
                        <h2 className='font-semibold text-gray-800 dark:text-white'>Specifications</h2>
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <label className='label-style'>Fuel Type</label>
                                <select name='fuelType' value={form.fuelType} onChange={handleChange} className='input-style'>
                                    {FUEL_TYPES.map(f => <option key={f} value={f} className='capitalize'>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className='label-style'>Transmission</label>
                                <select name='transmission' value={form.transmission} onChange={handleChange} className='input-style'>
                                    {TRANSMISSION.map(t => <option key={t} value={t} className='capitalize'>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className='label-style'>Seats</label>
                                <input name='seats' type='number' min='1' max='12' value={form.seats} onChange={handleChange} placeholder='e.g. 5' className='input-style' />
                            </div>
                            <div>
                                <label className='label-style'>Features <span className='text-gray-400 font-normal'>(comma separated)</span></label>
                                <input name='features' value={form.features} onChange={handleChange} placeholder='e.g. GPS, Helmet, Insurance' className='input-style' />
                            </div>
                        </div>
                    </div>

                    {/* Location & Price */}
                    <div className='bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4'>
                        <h2 className='font-semibold text-gray-800 dark:text-white'>Location & Pricing</h2>
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <label className='label-style'>Pickup Location *</label>
                                <input name='location' value={form.location} onChange={handleChange} placeholder='e.g. Manali, HP' className='input-style' required />
                            </div>
                            <div>
                                <label className='label-style'>Price per Day (₹) *</label>
                                <input name='pricePerDay' type='number' min='1' value={form.pricePerDay} onChange={handleChange} placeholder='e.g. 1500' className='input-style' required />
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type='submit'
                        disabled={loading}
                        className='w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl transition-colors text-base shadow-lg flex items-center justify-center gap-2'
                    >
                        {loading
                            ? <><span className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' /> Listing vehicle…</>
                            : '🚗 List My Vehicle'}
                    </button>
                </form>
            </div>

            {/* Inline styles for form inputs */}
            <style>{`
                .label-style { display:block; font-size:0.75rem; font-weight:600; color:#6b7280; margin-bottom:0.25rem; }
                .dark .label-style { color:#9ca3af; }
                .input-style { width:100%; padding:0.5rem 0.75rem; border-radius:0.5rem; border:1.5px solid #e5e7eb; background:#fff; color:#111827; font-size:0.875rem; outline:none; transition:border-color 0.15s; }
                .input-style:focus { border-color:#3b82f6; box-shadow:0 0 0 2px rgba(59,130,246,0.2); }
                .dark .input-style { background:#374151; border-color:#4b5563; color:#f9fafb; }
                .dark .input-style:focus { border-color:#60a5fa; }
            `}</style>
        </div>
    );
};

export default AddVehicle;
