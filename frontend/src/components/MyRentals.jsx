import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Car, Loader2 } from 'lucide-react';

const STATUS_COLORS = {
    pending:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
    confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
};

const RentalCard = ({ rental, viewMode, onStatusChange }) => {
    const isOwner = viewMode === 'listings';
    const vehicle = rental.vehicle;
    const person = isOwner ? rental.renter : rental.owner;

    const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden'>
            <div className='flex gap-4 p-4'>
                {vehicle?.images?.[0]
                    ? <img src={vehicle.images[0]} alt='' className='w-24 h-24 rounded-lg object-cover flex-shrink-0' />
                    : <div className='w-24 h-24 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0'>
                        <Car className='w-8 h-8 text-gray-400' />
                      </div>
                }
                <div className='flex-1 min-w-0'>
                    <div className='flex items-start justify-between gap-2'>
                        <h3 className='font-semibold text-gray-900 dark:text-white text-sm leading-tight truncate'>
                            {vehicle?.title || 'Vehicle unavailable'}
                        </h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 capitalize ${STATUS_COLORS[rental.status] || ''}`}>
                            {rental.status}
                        </span>
                    </div>

                    {vehicle && (
                        <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1'>
                            <MapPin className='w-3 h-3' /> {vehicle.location}
                        </p>
                    )}

                    <div className='flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 mt-1'>
                        <Calendar className='w-3 h-3' />
                        {fmt(rental.startDate)} — {fmt(rental.endDate)}
                        <span className='text-gray-400'>({rental.totalDays}d)</span>
                    </div>

                    <p className='text-sm font-bold text-blue-600 dark:text-blue-400 mt-1'>₹{rental.totalAmount?.toLocaleString()}</p>

                    {person && (
                        <div className='flex items-center gap-2 mt-2'>
                            {person.profilePicture
                                ? <img src={person.profilePicture} alt='' className='w-6 h-6 rounded-full object-cover' />
                                : <div className='w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center'>
                                    <span className='text-white text-xs font-bold'>{person.username?.[0]?.toUpperCase()}</span>
                                  </div>
                            }
                            <span className='text-xs text-gray-500 dark:text-gray-400'>
                                {isOwner ? 'Renter' : 'Owner'}: <span className='font-medium text-gray-700 dark:text-gray-200'>@{person.username}</span>
                            </span>
                        </div>
                    )}

                    {rental.message && (
                        <p className='text-xs text-gray-500 dark:text-gray-400 mt-1 italic'>"{rental.message}"</p>
                    )}
                </div>
            </div>

            {/* Owner actions */}
            {isOwner && rental.status === 'pending' && (
                <div className='border-t border-gray-100 dark:border-gray-700 flex'>
                    <button
                        onClick={() => onStatusChange(rental._id, 'confirmed')}
                        className='flex-1 py-2.5 text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors'
                    >
                        Confirm
                    </button>
                    <div className='w-px bg-gray-100 dark:bg-gray-700' />
                    <button
                        onClick={() => onStatusChange(rental._id, 'cancelled')}
                        className='flex-1 py-2.5 text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors'
                    >
                        Decline
                    </button>
                </div>
            )}
            {isOwner && rental.status === 'confirmed' && (
                <div className='border-t border-gray-100 dark:border-gray-700 flex'>
                    <button
                        onClick={() => onStatusChange(rental._id, 'completed')}
                        className='flex-1 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors'
                    >
                        Mark Completed
                    </button>
                </div>
            )}

            {/* Renter can cancel if pending */}
            {!isOwner && rental.status === 'pending' && (
                <div className='border-t border-gray-100 dark:border-gray-700 flex'>
                    <button
                        onClick={() => onStatusChange(rental._id, 'cancelled')}
                        className='flex-1 py-2.5 text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors'
                    >
                        Cancel Request
                    </button>
                </div>
            )}
        </div>
    );
};

const MyRentals = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState('bookings'); // 'bookings' | 'listings'
    const [data, setData] = useState({ asRenter: [], asOwner: [] });
    const [loading, setLoading] = useState(true);

    // Auto-switch to Booking Requests tab if owner has pending requests
    useEffect(() => {
        if (!loading && data.asOwner?.some(r => r.status === 'pending')) {
            setTab('listings');
        }
    }, [loading, data.asOwner]);

    const fetchRentals = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/vehicle/rental/mine`, { withCredentials: true });
            setData(res.data);
        } catch {
            toast.error('Failed to load rentals');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRentals(); }, []);

    const handleStatusChange = async (rentalId, status) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/v1/vehicle/rental/${rentalId}`, { status }, { withCredentials: true });
            toast.success(`Rental ${status}`);
            fetchRentals();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };

    const list = tab === 'bookings' ? data.asRenter : data.asOwner;

    return (
        <div className='min-h-screen bg-gray-50 dark:bg-gray-900 pb-10'>
            {/* Header */}
            <div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4'>
                <div className='max-w-2xl mx-auto flex items-center gap-3'>
                    <button onClick={() => navigate('/vehicle-rentals')} className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'>
                        <ArrowLeft className='w-5 h-5 text-gray-600 dark:text-gray-300' />
                    </button>
                    <div>
                        <h1 className='text-xl font-bold text-gray-900 dark:text-white'>My Rentals</h1>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>Manage your bookings and listings</p>
                    </div>
                </div>
            </div>

            <div className='max-w-2xl mx-auto px-6 mt-5'>
                {/* Tabs */}
                <div className='flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-5'>
                    {[
                        { key: 'bookings', label: `My Bookings (${data.asRenter?.length || 0})` },
                        { key: 'listings', label: `Booking Requests (${data.asOwner?.length || 0})`, pendingCount: data.asOwner?.filter(r => r.status === 'pending').length || 0 },
                    ].map(({ key, label, pendingCount }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                                tab === key
                                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            {label}
                            {pendingCount > 0 && (
                                <span className='bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center'>
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className='flex justify-center py-16'><Loader2 className='w-8 h-8 animate-spin text-blue-500' /></div>
                ) : list.length === 0 ? (
                    <div className='text-center py-16'>
                        <Car className='w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3' />
                        <p className='text-gray-500 dark:text-gray-400 font-medium'>
                            {tab === 'bookings' ? "You haven't booked any vehicles yet." : "No booking requests received yet."}
                        </p>
                        {tab === 'bookings' && (
                            <button
                                onClick={() => navigate('/vehicle-rentals')}
                                className='mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors'
                            >
                                Browse Vehicles
                            </button>
                        )}
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {list.map(rental => (
                            <RentalCard
                                key={rental._id}
                                rental={rental}
                                viewMode={tab}
                                onStatusChange={handleStatusChange}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyRentals;
