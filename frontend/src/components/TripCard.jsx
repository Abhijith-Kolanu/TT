import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
    MapPin, 
    Calendar, 
    Users, 
    DollarSign, 
    Clock, 
    Sparkles,
    Eye,
    Edit,
    Trash2
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import { removeTrip } from '@/redux/tripSlice';
import { formatCurrency } from '@/utils/currency';

const TripCard = ({ trip }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'draft':
                return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
            case 'generated':
                return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
            case 'published':
                return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
            case 'completed':
                return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
            default:
                return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
        }
    };

    const getBudgetIcon = (budgetType) => {
        switch (budgetType?.toLowerCase() || trip.preferences?.budgetType?.toLowerCase()) {
            case 'budget':
                return { icon: '💰', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' };
            case 'mid-range':
            case 'midrange':
                return { icon: '💰💰', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' };
            case 'luxury':
                return { icon: '💰💰💰', color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' };
            default:
                return { icon: '💰', color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-900/30' };
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'draft':
                return { icon: <Edit size={14} />, text: 'Draft' };
            case 'generated':
                return { icon: <Sparkles size={14} />, text: 'AI Generated' };
            case 'published':
                return { icon: <Eye size={14} />, text: 'Published' };
            case 'completed':
                return { icon: <MapPin size={14} />, text: 'Completed' };
            default:
                return { icon: <Clock size={14} />, text: 'Pending' };
        }
    };

    const getTripProgress = () => {
        if (trip.status === 'completed') return 100;
        if (trip.status === 'published') return 80;
        if (trip.status === 'generated') return 60;
        if (trip.status === 'draft') return 20;
        return 0;
    };

    const handleGenerateItinerary = async (e) => {
        e.stopPropagation();
        
        try {
            toast.loading('Generating your personalized itinerary...');
            
            const response = await axios.post(
                `http://localhost:8000/api/v1/trip/${trip._id}/generate`,
                {},
                { withCredentials: true }
            );

            if (response.data.success) {
                toast.dismiss();
                toast.success('Itinerary generated successfully!');
                navigate(`/trip/${trip._id}`);
            }
        } catch (error) {
            toast.dismiss();
            console.error('Error generating itinerary:', error);
            toast.error(error.response?.data?.message || 'Failed to generate itinerary');
        }
    };

    const handleViewTrip = () => {
        navigate(`/trip/${trip._id}`);
    };

    const handleDeleteTrip = async (e) => {
        e.stopPropagation();
        
        if (!window.confirm('Are you sure you want to delete this trip?')) {
            return;
        }

        try {
            const response = await axios.delete(
                `http://localhost:8000/api/v1/trip/${trip._id}`,
                { withCredentials: true }
            );

            if (response.data.success) {
                dispatch(removeTrip(trip._id));
                toast.success('Trip deleted successfully');
            }
        } catch (error) {
            console.error('Error deleting trip:', error);
            toast.error(error.response?.data?.message || 'Failed to delete trip');
        }
    };

    return (
        <div 
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
            onClick={handleViewTrip}
        >
            {/* Enhanced Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>
                
                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-xl text-white truncate pr-4">
                            {trip.title}
                        </h3>
                        <Badge className={`${getStatusColor(trip.status)} border-0`}>
                            <div className="flex items-center gap-1">
                                {getStatusIcon(trip.status).icon}
                                {getStatusIcon(trip.status).text}
                            </div>
                        </Badge>
                    </div>
                    
                    <div className="flex items-center text-white/90 text-sm mb-3">
                        <MapPin size={16} className="mr-2" />
                        <span>{trip.destination.city}, {trip.destination.country}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                        <div 
                            className="bg-white rounded-full h-2 transition-all duration-500"
                            style={{ width: `${getTripProgress()}%` }}
                        ></div>
                    </div>
                    <p className="text-white/80 text-xs">Trip Progress: {getTripProgress()}%</p>
                </div>
            </div>

            {/* Enhanced Trip Details */}
            <div className="p-6 space-y-4">
                {/* Dates with Enhanced Styling */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Calendar size={16} className="mr-2 text-blue-600" />
                            <span>
                                {formatDate(trip.dates.startDate)} - {formatDate(trip.dates.endDate)}
                            </span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Clock size={16} className="mr-1 text-purple-600" />
                            <span className="font-medium">{trip.dates.duration} days</span>
                        </div>
                    </div>
                </div>

                {/* Travelers and Budget with Enhanced Icons */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                        <div className="flex items-center text-sm">
                            <Users size={16} className="mr-2 text-blue-600" />
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {trip.travelers.adults + trip.travelers.children} Travelers
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {trip.travelers.adults} adult{trip.travelers.adults !== 1 ? 's' : ''}
                                    {trip.travelers.children > 0 && `, ${trip.travelers.children} child${trip.travelers.children !== 1 ? 'ren' : ''}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={`rounded-lg p-3 ${getBudgetIcon(trip.preferences?.budgetType).bg}`}>
                        <div className="flex items-center text-sm">
                            <span className="mr-2 text-lg">{getBudgetIcon(trip.preferences?.budgetType).icon}</span>
                            <div>
                                <p className={`font-medium ${getBudgetIcon(trip.preferences?.budgetType).color}`}>
                                    {trip.preferences?.budgetType || 'Budget'}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                                    {trip.preferences?.budgetType?.replace('-', ' ') || 'Standard'} Travel
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Interests */}
                <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">🎯 Interests:</p>
                    <div className="flex flex-wrap gap-2">
                        {trip.preferences?.interests?.slice(0, 4).map((interest) => (
                            <span
                                key={interest}
                                className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full capitalize font-medium border border-blue-200 dark:border-blue-700"
                            >
                                {interest}
                            </span>
                        ))}
                        {trip.preferences?.interests?.length > 4 && (
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium">
                                +{trip.preferences.interests.length - 4} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Enhanced Cost Estimate */}
                {trip.totalEstimatedCost && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-green-800 dark:text-green-200">
                                <DollarSign size={16} className="mr-2" />
                                <span className="font-medium">Estimated Budget:</span>
                            </div>
                            <span className="font-bold text-green-900 dark:text-green-100">
                                {formatCurrency(
                                    trip.totalEstimatedCost[trip.preferences?.budgetType]?.total || 0,
                                    trip.preferences?.currency || 'USD'
                                )}
                            </span>
                        </div>
                    </div>
                )}

                {/* AI Features Preview */}
                {trip.status === 'generated' && trip.itinerary?.length > 0 && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-3">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-purple-800 dark:text-purple-200">
                                <Sparkles size={16} className="mr-2" />
                                <span className="font-medium">AI Generated:</span>
                            </div>
                            <span className="font-bold text-purple-900 dark:text-purple-100">
                                {trip.itinerary.length} days planned
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Enhanced Actions */}
            <div className="p-6 pt-0">
                <div className="flex gap-3">
                    {trip.status === 'draft' ? (
                        <Button
                            onClick={handleGenerateItinerary}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3"
                        >
                            <Sparkles size={16} className="mr-2" />
                            Generate AI Itinerary
                        </Button>
                    ) : (
                        <Button
                            onClick={handleViewTrip}
                            className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium py-3"
                        >
                            <Eye size={16} className="mr-2" />
                            View Itinerary
                        </Button>
                    )}
                    
                    <Button
                        onClick={handleDeleteTrip}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-300 dark:border-red-700 px-4"
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TripCard;
