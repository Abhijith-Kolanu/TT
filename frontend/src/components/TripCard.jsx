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
        switch (budgetType) {
            case 'budget':
                return '💰';
            case 'mid-range':
                return '💰💰';
            case 'luxury':
                return '💰💰💰';
            default:
                return '💰';
        }
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
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={handleViewTrip}
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                        {trip.title}
                    </h3>
                    <Badge className={`ml-2 ${getStatusColor(trip.status)}`}>
                        {trip.status}
                    </Badge>
                </div>
                
                <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-2">
                    <MapPin size={16} className="mr-1" />
                    <span>{trip.destination.city}, {trip.destination.country}</span>
                </div>
            </div>

            {/* Trip Details */}
            <div className="p-4 space-y-3">
                {/* Dates */}
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Calendar size={16} className="mr-2" />
                    <span>
                        {formatDate(trip.dates.startDate)} - {formatDate(trip.dates.endDate)}
                    </span>
                    <Clock size={16} className="ml-4 mr-1" />
                    <span>{trip.dates.duration} days</span>
                </div>

                {/* Travelers and Budget */}
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Users size={16} className="mr-2" />
                        <span>
                            {trip.travelers.adults} adult{trip.travelers.adults !== 1 ? 's' : ''}
                            {trip.travelers.children > 0 && `, ${trip.travelers.children} child${trip.travelers.children !== 1 ? 'ren' : ''}`}
                        </span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <span className="mr-1">{getBudgetIcon(trip.preferences.budgetType)}</span>
                        <span className="capitalize">{trip.preferences.budgetType}</span>
                    </div>
                </div>

                {/* Interests */}
                <div className="flex flex-wrap gap-1">
                    {trip.preferences.interests.slice(0, 3).map((interest) => (
                        <span
                            key={interest}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full capitalize"
                        >
                            {interest}
                        </span>
                    ))}
                    {trip.preferences.interests.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                            +{trip.preferences.interests.length - 3} more
                        </span>
                    )}
                </div>

                {/* Cost Estimate */}
                {trip.totalEstimatedCost && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <DollarSign size={16} className="mr-1" />
                        <span>
                            Estimated: ${trip.totalEstimatedCost[trip.preferences.budgetType]?.total?.toLocaleString() || 'N/A'}
                        </span>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex gap-2">
                {trip.status === 'draft' ? (
                    <Button
                        onClick={handleGenerateItinerary}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
                    >
                        <Sparkles size={16} className="mr-2" />
                        Generate AI Itinerary
                    </Button>
                ) : (
                    <Button
                        onClick={handleViewTrip}
                        variant="outline"
                        className="flex-1 text-sm py-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <Eye size={16} className="mr-2" />
                        View Itinerary
                    </Button>
                )}
                
                <Button
                    onClick={handleDeleteTrip}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 border-gray-300 dark:border-gray-600"
                >
                    <Trash2 size={16} />
                </Button>
            </div>
        </div>
    );
};

export default TripCard;
