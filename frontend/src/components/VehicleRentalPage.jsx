import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Filter, Plus, Car, Bike, Compass, Star, ChevronDown } from 'lucide-react';

const VEHICLE_TYPES = ['all', 'car', 'bike', 'suv', 'scooter', 'bicycle', 'atv', 'jeep'];

const typeIcon = (type) => {
    if (['bike', 'scooter', 'bicycle'].includes(type)) return <Bike className='w-4 h-4' />;
    return <Car className='w-4 h-4' />;
};

const typeColor = {
    car: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    bike: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    suv: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    scooter: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    bicycle: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    atv: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    jeep: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
};

const VehicleRentalPage = () => {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [locationFilter, setLocationFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [maxPrice, setMaxPrice] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [showBooking, setShowBooking] = useState(false);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;
            if (selectedType !== 'all') params.type = selectedType;
            if (locationFilter) params.location = locationFilter;
            if (maxPrice) params.maxPrice = maxPrice;

            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/vehicle`, {
                params,
                withCredentials: true,
            });
            setVehicles(res.data.vehicles || []);
        } catch (err) {
            toast.error('Failed to load vehicles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, [selectedType]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchVehicles();
    };

    const openBooking = (vehicle) => {
        setSelectedVehicle(vehicle);
        setShowBooking(true);
    };

    if (showBooking && selectedVehicle) {
        return (
            <BookingModal
                vehicle={selectedVehicle}
                onClose={() => { setShowBooking(false); setSelectedVehicle(null); }}
                onSuccess={() => { setShowBooking(false); setSelectedVehicle(null); navigate('/vehicle-rentals/my'); }}
            />
        );
    }

    return (
        <div className='min-h-screen bg-gray-50 dark:bg-gray-900 pb-10'>
            {/* Header */}
            <div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-5'>
                <div className='max-w-5xl mx-auto'>
                    <div className='flex items-center justify-between mb-4'>
                        <div>
                            <h1 className='text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2'>
                                <Compass className='w-6 h-6 text-blue-500' /> Vehicle Rentals
                            </h1>
                            <p className='text-sm text-gray-500 dark:text-gray-400 mt-0.5'>Find the perfect ride for your adventure</p>
                        </div>
                        <div className='flex items-center gap-2'>
                            <button
                                onClick={() => navigate('/vehicle-rentals/my')}
                                className='flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg transition-colors'
                            >
                                My Rentals
                            </button>
                            <button
                                onClick={() => navigate('/vehicle-rentals/add')}
                                className='flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow'
                            >
                                <Plus className='w-4 h-4' /> List Your Vehicle
                            </button>
                        </div>
                    </div>

                    {/* Search bar */}
                    <form onSubmit={handleSearch} className='flex gap-2'>
                        <div className='flex-1 relative'>
                            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                            <input
                                type='text'
                                placeholder='Search by name, brand, location…'
                                className='w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <button
                            type='button'
                            onClick={() => setShowFilters(!showFilters)}
                            className='flex items-center gap-1.5 px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors'
                        >
                            <Filter className='w-4 h-4' /> Filters <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>
                        <button type='submit' className='px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors'>
                            Search
                        </button>
                    </form>

                    {/* Expandable filters */}
                    {showFilters && (
                        <div className='mt-3 flex flex-wrap gap-3 pt-3 border-t border-gray-100 dark:border-gray-700'>
                            <div className='flex flex-col gap-1'>
                                <label className='text-xs font-medium text-gray-500 dark:text-gray-400'>Location</label>
                                <div className='relative'>
                                    <MapPin className='absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400' />
                                    <input
                                        type='text'
                                        placeholder='e.g. Manali'
                                        className='pl-8 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-40 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                        value={locationFilter}
                                        onChange={e => setLocationFilter(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className='text-xs font-medium text-gray-500 dark:text-gray-400'>Max Price/Day (₹)</label>
                                <input
                                    type='number'
                                    placeholder='e.g. 2000'
                                    className='px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-36 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                    value={maxPrice}
                                    onChange={e => setMaxPrice(e.target.value)}
                                />
                            </div>
                            <div className='flex items-end'>
                                <button onClick={() => { setLocationFilter(''); setMaxPrice(''); setSearch(''); fetchVehicles(); }} className='px-3 py-2 text-xs text-red-500 hover:text-red-600 font-medium'>
                                    Clear all
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Type filter pills */}
            <div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3'>
                <div className='max-w-5xl mx-auto flex gap-2 overflow-x-auto pb-1 scrollbar-hide'>
                    {VEHICLE_TYPES.map(type => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                                selectedType === type
                                    ? 'bg-blue-600 text-white shadow'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            {type === 'all' ? 'All Types' : type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className='max-w-5xl mx-auto px-6 mt-6'>
                {loading ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className='bg-white dark:bg-gray-800 rounded-xl h-72 animate-pulse' />
                        ))}
                    </div>
                ) : vehicles.length === 0 ? (
                    <div className='text-center py-20'>
                        <Car className='w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3' />
                        <p className='text-lg font-semibold text-gray-500 dark:text-gray-400'>No vehicles found</p>
                        <p className='text-sm text-gray-400 dark:text-gray-500 mt-1'>Try adjusting your search or filters</p>
                        <button onClick={() => navigate('/vehicle-rentals/add')} className='mt-4 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors'>
                            + List the first vehicle
                        </button>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
                        {vehicles.map(vehicle => (
                            <VehicleCard key={vehicle._id} vehicle={vehicle} onBook={() => openBooking(vehicle)} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Vehicle Card ────────────────────────────────────────────────────────────
const VehicleCard = ({ vehicle, onBook }) => {
    return (
        <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700 overflow-hidden group'>
            {/* Image */}
            <div className='relative h-44 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 overflow-hidden'>
                {vehicle.images && vehicle.images.length > 0 ? (
                    <img
                        src={vehicle.images[0]}
                        alt={vehicle.title}
                        className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                    />
                ) : (
                    <div className='w-full h-full flex items-center justify-center'>
                        <Car className='w-12 h-12 text-gray-400' />
                    </div>
                )}
                {/* Type badge */}
                <span className={`absolute top-2 left-2 flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full capitalize ${typeColor[vehicle.type] || 'bg-gray-100 text-gray-700'}`}>
                    {typeIcon(vehicle.type)} {vehicle.type}
                </span>
                {/* Price badge */}
                <span className='absolute top-2 right-2 bg-white/90 dark:bg-gray-900/80 text-gray-900 dark:text-white text-xs font-bold px-2.5 py-1 rounded-full shadow'>
                    ₹{vehicle.pricePerDay.toLocaleString()}/day
                </span>
            </div>

            {/* Info */}
            <div className='p-4'>
                <h3 className='font-bold text-gray-900 dark:text-white text-base truncate'>{vehicle.title}</h3>
                <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>{vehicle.brand} {vehicle.model} · {vehicle.year}</p>

                <div className='flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400'>
                    <MapPin className='w-3 h-3 flex-shrink-0' />
                    <span className='truncate'>{vehicle.location}</span>
                </div>

                {/* Features */}
                {vehicle.features && vehicle.features.length > 0 && (
                    <div className='flex flex-wrap gap-1 mt-2'>
                        {vehicle.features.slice(0, 3).map((f, i) => (
                            <span key={i} className='text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full'>{f}</span>
                        ))}
                        {vehicle.features.length > 3 && (
                            <span className='text-xs text-gray-400 dark:text-gray-500'>+{vehicle.features.length - 3}</span>
                        )}
                    </div>
                )}

                {/* Owner & Book */}
                <div className='flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700'>
                    <div className='flex items-center gap-2'>
                        <img
                            src={vehicle.owner?.profilePicture || `https://ui-avatars.com/api/?name=${vehicle.owner?.username}&background=3b82f6&color=fff&size=32`}
                            alt={vehicle.owner?.username}
                            className='w-6 h-6 rounded-full object-cover'
                        />
                        <span className='text-xs text-gray-500 dark:text-gray-400 truncate max-w-[80px]'>{vehicle.owner?.username}</span>
                    </div>
                    <button
                        onClick={onBook}
                        className='px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors'
                    >
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Booking Modal ────────────────────────────────────────────────────────────
const BookingModal = ({ vehicle, onClose, onSuccess }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    const totalDays = startDate && endDate
        ? Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)))
        : 0;
    const totalAmount = totalDays * vehicle.pricePerDay;

    const handleBook = async (e) => {
        e.preventDefault();
        if (!startDate || !endDate) return toast.error('Please select dates');
        if (new Date(endDate) <= new Date(startDate)) return toast.error('End date must be after start date');

        try {
            setLoading(true);
            await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/vehicle/rental/book`, {
                vehicleId: vehicle._id,
                startDate,
                endDate,
                message,
            }, { withCredentials: true });
            toast.success('Booking request sent!');
            onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Booking failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4'>
            <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden'>
                {/* Header */}
                <div className='relative h-36 bg-gradient-to-br from-blue-500 to-indigo-600'>
                    {vehicle.images?.[0] && (
                        <img src={vehicle.images[0]} alt={vehicle.title} className='w-full h-full object-cover opacity-60' />
                    )}
                    <div className='absolute inset-0 p-4 flex flex-col justify-end'>
                        <h2 className='text-white font-bold text-lg'>{vehicle.title}</h2>
                        <p className='text-white/80 text-sm'>{vehicle.brand} {vehicle.model} · {vehicle.location}</p>
                    </div>
                    <button onClick={onClose} className='absolute top-3 right-3 text-white/80 hover:text-white text-xl font-bold'>✕</button>
                </div>

                <form onSubmit={handleBook} className='p-5 space-y-4'>
                    <div className='grid grid-cols-2 gap-3'>
                        <div>
                            <label className='text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1'>Start Date</label>
                            <input
                                type='date'
                                min={today}
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className='w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                required
                            />
                        </div>
                        <div>
                            <label className='text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1'>End Date</label>
                            <input
                                type='date'
                                min={startDate || today}
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className='w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                required
                            />
                        </div>
                    </div>

                    {totalDays > 0 && (
                        <div className='bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 flex items-center justify-between'>
                            <span className='text-sm text-gray-600 dark:text-gray-300'>{totalDays} day{totalDays > 1 ? 's' : ''} × ₹{vehicle.pricePerDay.toLocaleString()}</span>
                            <span className='font-bold text-blue-700 dark:text-blue-400 text-base'>₹{totalAmount.toLocaleString()}</span>
                        </div>
                    )}

                    <div>
                        <label className='text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1'>Message to owner (optional)</label>
                        <textarea
                            rows={2}
                            placeholder='Tell the owner about your trip plans…'
                            className='w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                        />
                    </div>

                    <div className='flex gap-3 pt-1'>
                        <button type='button' onClick={onClose} className='flex-1 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
                            Cancel
                        </button>
                        <button
                            type='submit'
                            disabled={loading}
                            className='flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2'
                        >
                            {loading ? <><span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' /> Sending…</> : 'Confirm Booking'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VehicleRentalPage;
