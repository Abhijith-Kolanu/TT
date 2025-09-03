import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, MapPin, Calendar, Users, DollarSign, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import { setTrips, addTrip, setLoading, setError } from '@/redux/tripSlice';
import CreateTripDialog from './CreateTripDialog';
import TripCard from './TripCard';

const TripPlanner = () => {
    const dispatch = useDispatch();
    const { trips, loading, error } = useSelector(store => store.trip);
    const { user } = useSelector(store => store.auth);
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    useEffect(() => {
        fetchUserTrips();
    }, []);

    const fetchUserTrips = async () => {
        try {
            dispatch(setLoading(true));
            const response = await axios.get('http://localhost:8000/api/v1/trip/my-trips', {
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
            const response = await axios.post('http://localhost:8000/api/v1/trip/create', tripData, {
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
        <div className="max-w-7xl mx-auto p-6 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-200">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Sparkles className="text-blue-600" />
                            AI Trip Planner
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Create personalized itineraries powered by artificial intelligence
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowCreateDialog(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Plan New Trip
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
                        <div className="flex items-center gap-3">
                            <MapPin className="text-green-600" size={24} />
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{trips.length}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Trips</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
                        <div className="flex items-center gap-3">
                            <Calendar className="text-blue-600" size={24} />
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {trips.filter(trip => trip.status === 'generated').length}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Generated</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
                        <div className="flex items-center gap-3">
                            <Users className="text-purple-600" size={24} />
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {trips.filter(trip => trip.status === 'published').length}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Published</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
                        <div className="flex items-center gap-3">
                            <DollarSign className="text-orange-600" size={24} />
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {trips.filter(trip => trip.status === 'completed').length}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trip List */}
            {trips.length === 0 ? (
                <div className="text-center py-12">
                    <div className="max-w-md mx-auto">
                        <MapPin size={64} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No trips yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Start planning your dream vacation with our AI-powered trip planner!
                        </p>
                        <Button
                            onClick={() => setShowCreateDialog(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Plus size={20} className="mr-2" />
                            Create Your First Trip
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trips.map((trip) => (
                        <TripCard key={trip._id} trip={trip} />
                    ))}
                </div>
            )}

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
