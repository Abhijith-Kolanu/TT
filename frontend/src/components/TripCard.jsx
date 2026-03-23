import React, { useState } from 'react';
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

const normalizeCountryLabel = (country) => {
    const raw = String(country || '').trim();
    if (!raw) return raw;

    const key = raw
        .toLowerCase()
        .replace(/[^a-z\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (['uk', 'u k', 'united kingdom', 'great britain', 'britain', 'england', 'scotland', 'wales', 'northern ireland'].includes(key)) {
        return 'UK';
    }

    return raw;
};

const TripCard = ({ trip }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isGenerating, setIsGenerating] = useState(false);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
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

    const getHeaderStatusBadgeClass = (status) => {
        switch (status) {
            case 'generated':
                return 'bg-white/20 text-white border border-white/30';
            case 'draft':
                return 'bg-white/15 text-white border border-white/25';
            case 'completed':
                return 'bg-emerald-500/20 text-white border border-emerald-200/40';
            default:
                return 'bg-white/20 text-white border border-white/30';
        }
    };

    const formatBudgetLabel = (value) => {
        const normalized = String(value || 'mid-range').toLowerCase().replace(/\s+/g, '-');
        if (normalized === 'midrange' || normalized === 'mid-range') return 'Mid-Range';
        if (normalized === 'budget') return 'Budget';
        if (normalized === 'luxury') return 'Luxury';
        return 'Mid-Range';
    };

    const getTripProgress = () => {
        if (trip.status === 'completed') return 100;
        if (trip.status === 'published') return 80;
        if (trip.status === 'generated') return 60;
        if (trip.status === 'draft') return 20;
        return 0;
    };

    const getSelectedBudgetKey = () => {
        const budgetType = String(trip?.preferences?.budgetType || '').toLowerCase();
        if (budgetType === 'mid-range' || budgetType === 'midrange' || budgetType === 'mid') {
            return 'midRange';
        }
        if (budgetType === 'luxury') return 'luxury';
        return 'budget';
    };

    const getEstimatedBudgetTotal = () => {
        const estimated = trip?.totalEstimatedCost;
        if (!estimated) return 0;

        const selectedKey = getSelectedBudgetKey();
        const fromSelected = Number(estimated?.[selectedKey]?.total || 0);
        if (fromSelected > 0) return fromSelected;

        const fallback = Number(estimated?.midRange?.total || estimated?.budget?.total || estimated?.luxury?.total || 0);
        return fallback > 0 ? fallback : 0;
    };

    const getTripCurrency = () => {
        const currency = String(trip?.preferences?.currency || '').trim().toUpperCase();
        return currency || 'USD';
    };

    const hasGeneratedItinerary = trip.status === 'generated' && (trip.itinerary?.length || 0) > 0;

    const handleGenerateItinerary = async (e) => {
        e.stopPropagation();
        if (isGenerating) return;
        
        try {
            setIsGenerating(true);
            toast.loading('Generating itinerary...');
            
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/v1/trip/${trip._id}/generate`,
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
            const status = error?.response?.status;
            if (status === 429) {
                toast.error('Rate limit reached. Please try again in a moment.');
            } else {
                toast.error(error.response?.data?.message || 'Unable to generate itinerary right now.');
            }
        } finally {
            setIsGenerating(false);
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
                `${import.meta.env.VITE_API_URL}/api/v1/trip/${trip._id}`,
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
            className="h-[620px] flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
            onClick={handleViewTrip}
        >
            {/* Enhanced Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-5 text-white relative overflow-hidden min-h-[160px]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>
                
                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-lg text-white truncate pr-4">
                            {trip.title}
                        </h3>
                        <Badge className={`${getHeaderStatusBadgeClass(trip.status)} whitespace-nowrap`}>
                            <div className="flex items-center gap-1">
                                {getStatusIcon(trip.status).icon}
                                {getStatusIcon(trip.status).text}
                            </div>
                        </Badge>
                    </div>
                    
                    <div className="flex items-center text-white/90 text-sm mb-2">
                        <MapPin size={16} className="mr-2" />
                        <span>{trip.destination.city}, {normalizeCountryLabel(trip.destination.country)}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                        <div 
                            className="bg-white rounded-full h-2 transition-all duration-500"
                            style={{ width: `${getTripProgress()}%` }}
                        ></div>
                    </div>
                    <p className="text-white/80 text-[11px]">Trip Progress: {getTripProgress()}%</p>
                </div>
            </div>

            {/* Enhanced Trip Details */}
            <div className="p-5 space-y-3 flex-1">
                {/* Dates with Enhanced Styling */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
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
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2.5">
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

                    <div className={`rounded-lg p-2.5 ${getBudgetIcon(trip.preferences?.budgetType).bg}`}>
                        <div className="flex items-center text-sm">
                            <span className="mr-2 text-lg">{getBudgetIcon(trip.preferences?.budgetType).icon}</span>
                            <div>
                                <p className={`font-medium ${getBudgetIcon(trip.preferences?.budgetType).color}`}>
                                    {formatBudgetLabel(trip.preferences?.budgetType)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Interests */}
                <div className="min-h-[84px]">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">🎯 Interests:</p>
                    <div className="flex flex-wrap gap-2 max-h-[60px] overflow-hidden">
                        {trip.preferences?.interests?.map((interest) => (
                            <span
                                key={interest}
                                className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full capitalize font-medium border border-blue-200 dark:border-blue-700"
                            >
                                {interest}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Compact Trip Snapshot Footer */}
                <div className="mt-auto border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-2.5">
                            <p className="text-[11px] font-medium text-green-700 dark:text-green-300">Estimated Budget</p>
                            <p className="text-sm font-bold text-green-900 dark:text-green-100 mt-1">
                                {formatCurrency(getEstimatedBudgetTotal(), getTripCurrency())}
                            </p>
                        </div>

                        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-2.5">
                            <p className="text-[11px] font-medium text-purple-700 dark:text-purple-300">
                                {hasGeneratedItinerary ? 'Itinerary' : 'Status'}
                            </p>
                            <p className="text-sm font-bold text-purple-900 dark:text-purple-100 mt-1">
                                {hasGeneratedItinerary ? `${trip.itinerary.length} days planned` : 'Draft in progress'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Actions */}
            <div className="p-5 pt-0 mt-auto">
                <div className="flex gap-3">
                    {trip.status === 'draft' ? (
                        <Button
                            onClick={handleGenerateItinerary}
                            disabled={isGenerating}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3"
                        >
                            <Sparkles size={16} className="mr-2" />
                            {isGenerating ? 'Generating...' : 'Generate AI Itinerary'}
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
