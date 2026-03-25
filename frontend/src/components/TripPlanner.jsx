import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
    MapPin, 
    Calendar, 
    Sparkles, 
    Clock,
    Globe,
    Search,
    Plane,
    BookOpen,
    Zap,
    Compass,
    DollarSign
} from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import { setTrips, addTrip, setLoading, setError } from '@/redux/tripSlice';
import CreateTripDialog from './CreateTripDialog';
import TripCard from './TripCard';

const TripPlanner = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { trips, loading } = useSelector(store => store.trip);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [filterBy, setFilterBy] = useState('all');
    useEffect(() => {
        fetchUserTrips();
    }, []);

    const fetchUserTrips = async () => {
        try {
            dispatch(setLoading(true));
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/trip/my-trips`, {
                withCredentials: true
            });
            
            if (response.data.success) {
                dispatch(setTrips(response.data.trips));
            }
        } catch (error) {
            console.error('Error fetching trips:', error);
            dispatch(setError(error.response?.data?.message || 'Failed to fetch trips'));
            toast.error('Failed to fetch your trips');
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleCreateTrip = async (tripData) => {
        try {
            dispatch(setLoading(true));
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/trip/create`, tripData, {
                withCredentials: true
            });
            
            if (response.data.success) {
                dispatch(addTrip(response.data.trip));
                setShowCreateDialog(false);
                toast.success('Trip created successfully!');
            }
        } catch (error) {
            console.error('Error creating trip:', error);
            toast.error(error.response?.data?.message || 'Failed to create trip');
        } finally {
            dispatch(setLoading(false));
        }
    };

    // Filter and sort trips
    const filteredAndSortedTrips = trips
        .filter(trip => {
            if (filterBy === 'all') return true;
            return trip.status === filterBy;
        })
        .filter(trip => {
            if (!searchQuery) return true;
            return (
                trip.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                trip.destination?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                trip.destination?.country?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'alphabetical':
                    return a.title?.localeCompare(b.title);
                case 'destination':
                    return a.destination?.city?.localeCompare(b.destination?.city);
                default:
                    return 0;
            }
        });

    const getEnhancedStats = () => {
        const countries = new Set();
        const completedTrips = trips.filter(trip => trip.status === 'completed');

        completedTrips.forEach(trip => {
            if (trip.destination?.country) {
                countries.add(trip.destination.country);
            }
        });

        return {
            countries: countries.size,
            generated: trips.filter(trip => trip.status === 'generated').length,
            completed: trips.filter(trip => trip.status === 'completed').length,
            draft: trips.filter(trip => trip.status === 'draft').length
        };
    };

    const stats = getEnhancedStats();

    if (loading && trips.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading your trips...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 transition-all duration-300">
            <div className="max-w-7xl mx-auto p-6">
                {/* Hero Section */}
                <div className="mb-8">
                    <div className="text-center mb-8 relative rounded-3xl border border-white/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl shadow-xl p-8 md:p-10 overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute -top-10 -left-6 w-72 h-72 bg-blue-300/40 rounded-full mix-blend-multiply filter blur-2xl opacity-40 dark:opacity-20"></div>
                            <div className="absolute -bottom-14 -right-8 w-72 h-72 bg-purple-300/40 rounded-full mix-blend-multiply filter blur-2xl opacity-40 dark:opacity-20"></div>
                        </div>
                        
                        {/* Content */}
                        <div className="relative z-10">
                            <div className="flex items-center justify-center mb-5">
                                <div className="p-3.5 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl shadow-lg ring-4 ring-white/40 dark:ring-gray-800/50">
                                    <Sparkles className="text-white" size={32} />
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent mb-4 tracking-tight leading-[1.15] pb-1">
                                AI Trip Planner
                            </h1>
                            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-7 leading-relaxed">
                                Create realistic itineraries with smart day plans, practical recommendations, budget visibility, and real-time destination updates powered by AI.
                            </p>
                            <div className="flex items-center justify-center gap-4">
                                <Button
                                    onClick={() => setShowCreateDialog(true)}
                                    className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                >
                                    <Zap size={20} className="mr-2" />
                                    {trips.length === 0 ? 'Start Planning' : 'Plan New Trip'}
                                </Button>
                                {trips.length > 0 && (
                                    <Button
                                        onClick={() => {
                                            // Navigate to the most recent trip
                                            const mostRecent = [...trips].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
                                            if (mostRecent) {
                                                navigate(`/trip/${mostRecent._id}`);
                                            }
                                        }}
                                        variant="outline"
                                        className="px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-300 bg-white/90 dark:bg-gray-800 transition-all duration-200"
                                    >
                                        <BookOpen size={20} className="mr-2" />
                                        View Recent Trip
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Planner Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {/* Draft Trips */}
                        <div className="bg-white/90 dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                    <Clock className="text-blue-600 dark:text-blue-400" size={24} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.draft}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Draft Trips</p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">Pending itinerary</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* AI Generated */}
                        <div className="bg-white/90 dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                    <Sparkles className="text-green-600 dark:text-green-400" size={24} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.generated}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">AI Generated</p>
                                    <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">Ready itineraries</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Completed Trips */}
                        <div className="bg-white/90 dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                                    <MapPin className="text-purple-600 dark:text-purple-400" size={24} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Completed Trips</p>
                                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">Travel finished</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Countries Covered */}
                        <div className="bg-white/90 dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                                    <Globe className="text-orange-600 dark:text-orange-400" size={24} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.countries}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Countries Covered</p>
                                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mt-1">Destination diversity</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Features Showcase */}
                    {trips.length === 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 text-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Compass className="text-white" size={28} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Smart Destinations</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    AI analyzes your preferences to suggest perfect destinations and hidden gems
                                </p>
                            </div>
                            
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 text-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Clock className="text-white" size={28} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Optimized Itineraries</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    Automatically create day-by-day schedules optimized for time and distance
                                </p>
                            </div>
                            
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 text-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <DollarSign className="text-white" size={28} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Budget Planning</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    Get accurate cost estimates and budget breakdowns for your entire trip
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Trips Section */}
                {trips.length > 0 && (
                    <div>
                        {/* Search and Filter Bar */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mb-6">
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                <div className="flex-1 max-w-md">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            placeholder="Search trips by destination or title..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <select
                                        value={filterBy}
                                        onChange={(e) => setFilterBy(e.target.value)}
                                        className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="draft">Draft</option>
                                        <option value="generated">Generated</option>
                                        <option value="published">Published</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                    
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                        <option value="alphabetical">Alphabetical</option>
                                        <option value="destination">By Destination</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Trips Grid */}
                        {filteredAndSortedTrips.length === 0 ? (
                            <div className="text-center py-12">
                                <Search size={64} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No trips found</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Try adjusting your search or filter criteria
                                </p>
                                <Button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setFilterBy('all');
                                    }}
                                    variant="outline"
                                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-300 bg-white dark:bg-gray-800"
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredAndSortedTrips.map((trip) => (
                                    <TripCard key={trip._id} trip={trip} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Empty State for No Trips */}
                {trips.length === 0 && !loading && (
                    <div className="text-center py-16">
                        <div className="max-w-md mx-auto">
                            <div className="w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Plane size={48} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ready for your next adventure?</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                                Create your first AI-powered trip itinerary and discover amazing destinations!
                            </p>
                            <Button
                                onClick={() => setShowCreateDialog(true)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                <Sparkles size={24} className="mr-3" />
                                Create Your First Trip
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Trip Dialog */}
            <CreateTripDialog
                open={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                onSubmit={handleCreateTrip}
            />
        </div>
    );
};

export default TripPlanner;
