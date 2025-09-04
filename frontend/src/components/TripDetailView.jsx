import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
    MapPin, 
    Calendar, 
    Clock, 
    DollarSign, 
    Users, 
    Star,
    Navigation,
    Camera,
    Utensils,
    Coffee,
    ShoppingBag,
    Music,
    Heart,
    Share2,
    Edit,
    Download,
    ChevronLeft,
    ChevronRight,
    Filter,
    SortAsc,
    Landmark,
    PartyPopper,
    Eye,
    Target,
    Plus,
    Trash2,
    Save,
    RefreshCw,
    Map,
    BookOpen,
    CheckCircle,
    AlertCircle,
    Info,
    Phone,
    Wifi,
    Car,
    Train,
    Plane,
    Sun,
    Cloud,
    Umbrella,
    List,
    StickyNote
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import { formatCurrency } from '@/utils/currency';
import { setCurrentTrip, setLoading } from '@/redux/tripSlice';

const TripDetailView = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentTrip, loading } = useSelector(store => store.trip);
    const [selectedDay, setSelectedDay] = useState(0);
    const [activeTab, setActiveTab] = useState('itinerary');
    
    // Itinerary specific states
    const [editMode, setEditMode] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [showAddActivity, setShowAddActivity] = useState(false);
    const [activityFilter, setActivityFilter] = useState('all');
    const [viewMode, setViewMode] = useState('timeline'); // timeline, list, map
    const [completedActivities, setCompletedActivities] = useState(new Set());
    const [activityNotes, setActivityNotes] = useState({});
    const [weatherInfo, setWeatherInfo] = useState({});
    const [transportationInfo, setTransportationInfo] = useState({});
    
    // Other existing states
    const [recommendations, setRecommendations] = useState({
        restaurants: [],
        attractions: [],
        events: [],
        hiddenGems: [],
        shopping: []
    });
    const [realTimeInfo, setRealTimeInfo] = useState(null);
    const [routeData, setRouteData] = useState(null);

    useEffect(() => {
        fetchTripDetails();
    }, [tripId]);

    useEffect(() => {
        if (currentTrip && activeTab === 'recommendations') {
            fetchSmartRecommendations();
        }
        if (currentTrip && activeTab === 'realtime') {
            fetchRealTimeInfo();
        }
    }, [currentTrip, activeTab]);

    const fetchTripDetails = async () => {
        try {
            dispatch(setLoading(true));
            const response = await axios.get(`http://localhost:8000/api/v1/trip/${tripId}`, {
                withCredentials: true
            });
            
            if (response.data.success) {
                dispatch(setCurrentTrip(response.data.trip));
                if (response.data.trip.itinerary.length > 0) {
                    setSelectedDay(0);
                }
            }
        } catch (error) {
            console.error('Error fetching trip details:', error);
            toast.error('Failed to fetch trip details');
            navigate('/planner');
        } finally {
            dispatch(setLoading(false));
        }
    };

    const fetchSmartRecommendations = async () => {
        try {
            console.log('Fetching smart recommendations for trip:', tripId);
            const response = await axios.get(`http://localhost:8000/api/v1/trip/${tripId}/recommendations`, {
                withCredentials: true
            });
            
            console.log('Recommendations response:', response.data);
            
            if (response.data.success) {
                console.log('Setting recommendations state:', response.data.recommendations);
                setRecommendations(response.data.recommendations);
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            
            if (error.response?.status === 429) {
                toast.error('API quota exceeded. Please try again in 24 hours.');
            } else if (error.response?.status === 500) {
                toast.error('Server error. Please try again later.');
            } else {
                toast.error('Failed to fetch recommendations');
            }
        }
    };

    const fetchRealTimeInfo = async () => {
        try {
            console.log('Attempting to fetch real-time info for trip:', tripId);
            const response = await axios.get(`http://localhost:8000/api/v1/trip/${tripId}/realtime`, {
                withCredentials: true
            });
            
            console.log('Real-time info response:', response.data);
            
            if (response.data.success) {
                setRealTimeInfo(response.data.realTimeInfo);
                console.log('Real-time info set:', response.data.realTimeInfo);
            } else {
                console.error('Real-time info request unsuccessful:', response.data);
                toast.error('Failed to fetch real-time information');
            }
        } catch (error) {
            console.error('Error fetching real-time info:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
            
            if (error.response?.status === 404) {
                toast.error('Trip not found');
            } else if (error.response?.status === 500) {
                toast.error('Server error - please try again later');
            } else if (error.code === 'ECONNREFUSED') {
                toast.error('Cannot connect to server - please check if backend is running');
            } else {
                toast.error('Failed to fetch real-time information');
            }
        }
    };

    const optimizeRoute = async (selectedDay, customLocations = []) => {
        try {
            const response = await axios.post(`http://localhost:8000/api/v1/trip/${tripId}/optimize-route`, {
                selectedDay,
                customLocations
            }, {
                withCredentials: true
            });
            
            if (response.data.success) {
                setRouteData(response.data.routeData);
                toast.success('Route optimized successfully!');
            }
        } catch (error) {
            console.error('Error optimizing route:', error);
            toast.error('Failed to optimize route');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        return timeString;
    };

    // ====== COMPREHENSIVE ITINERARY FUNCTIONS ======

    // Activity Management Functions
    const addActivity = async (dayNumber, activityData) => {
        try {
            const response = await axios.post(`http://localhost:8000/api/v1/trip/${tripId}/activity`, {
                dayNumber,
                activity: activityData
            }, { withCredentials: true });

            if (response.data.success) {
                await fetchTripDetails(); // Refresh trip data
                toast.success('Activity added successfully!');
                setShowAddActivity(false);
            }
        } catch (error) {
            console.error('Error adding activity:', error);
            toast.error('Failed to add activity');
        }
    };

    const updateActivity = async (dayNumber, activityIndex, updatedData) => {
        try {
            const response = await axios.put(`http://localhost:8000/api/v1/trip/${tripId}/activity`, {
                dayNumber,
                activityIndex,
                activity: updatedData
            }, { withCredentials: true });

            if (response.data.success) {
                await fetchTripDetails();
                toast.success('Activity updated successfully!');
                setEditMode(false);
                setSelectedActivity(null);
            }
        } catch (error) {
            console.error('Error updating activity:', error);
            toast.error('Failed to update activity');
        }
    };

    const deleteActivity = async (dayNumber, activityIndex) => {
        if (!window.confirm('Are you sure you want to delete this activity?')) return;

        try {
            const response = await axios.delete(`http://localhost:8000/api/v1/trip/${tripId}/activity`, {
                data: { dayNumber, activityIndex },
                withCredentials: true
            });

            if (response.data.success) {
                await fetchTripDetails();
                toast.success('Activity deleted successfully!');
            }
        } catch (error) {
            console.error('Error deleting activity:', error);
            toast.error('Failed to delete activity');
        }
    };

    const reorderActivities = async (dayNumber, newOrder) => {
        try {
            const response = await axios.put(`http://localhost:8000/api/v1/trip/${tripId}/reorder`, {
                dayNumber,
                newOrder
            }, { withCredentials: true });

            if (response.data.success) {
                await fetchTripDetails();
                toast.success('Activities reordered successfully!');
            }
        } catch (error) {
            console.error('Error reordering activities:', error);
            toast.error('Failed to reorder activities');
        }
    };

    // Activity Status Functions
    const toggleActivityCompletion = (dayNumber, activityIndex) => {
        const activityId = `${dayNumber}-${activityIndex}`;
        const newCompleted = new Set(completedActivities);
        
        if (newCompleted.has(activityId)) {
            newCompleted.delete(activityId);
            toast.success('Activity marked as incomplete');
        } else {
            newCompleted.add(activityId);
            toast.success('Activity completed! 🎉');
        }
        
        setCompletedActivities(newCompleted);
        // Persist to localStorage or backend
        localStorage.setItem(`trip-${tripId}-completed`, JSON.stringify([...newCompleted]));
    };

    const addActivityNote = (dayNumber, activityIndex, note) => {
        const activityId = `${dayNumber}-${activityIndex}`;
        const newNotes = { ...activityNotes, [activityId]: note };
        setActivityNotes(newNotes);
        localStorage.setItem(`trip-${tripId}-notes`, JSON.stringify(newNotes));
        toast.success('Note saved!');
    };

    // Trip Management Functions
    const regenerateItinerary = async () => {
        if (!window.confirm('This will regenerate the entire itinerary. Are you sure?')) return;

        try {
            toast.loading('Regenerating itinerary with AI...');
            const response = await axios.post(`http://localhost:8000/api/v1/trip/${tripId}/regenerate`, {}, {
                withCredentials: true
            });

            if (response.data.success) {
                await fetchTripDetails();
                toast.dismiss();
                toast.success('Itinerary regenerated successfully!');
            }
        } catch (error) {
            console.error('Error regenerating itinerary:', error);
            toast.dismiss();
            toast.error('Failed to regenerate itinerary');
        }
    };

    const exportItinerary = async (format = 'pdf') => {
        try {
            toast.loading('Generating export...');
            const response = await axios.get(`http://localhost:8000/api/v1/trip/${tripId}/export/${format}`, {
                withCredentials: true,
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { 
                type: format === 'pdf' ? 'application/pdf' : 'application/json' 
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${currentTrip.title}-itinerary.${format}`;
            link.click();

            toast.dismiss();
            toast.success(`Itinerary exported as ${format.toUpperCase()}!`);
        } catch (error) {
            console.error('Error exporting itinerary:', error);
            toast.dismiss();
            toast.error('Failed to export itinerary');
        }
    };

    const shareItinerary = async () => {
        try {
            const response = await axios.post(`http://localhost:8000/api/v1/trip/${tripId}/share`, {}, {
                withCredentials: true
            });

            if (response.data.success) {
                const shareUrl = response.data.shareUrl;
                
                if (navigator.share) {
                    await navigator.share({
                        title: currentTrip.title,
                        text: `Check out my trip itinerary for ${currentTrip.destination.city}!`,
                        url: shareUrl
                    });
                } else {
                    await navigator.clipboard.writeText(shareUrl);
                    toast.success('Share link copied to clipboard!');
                }
            }
        } catch (error) {
            console.error('Error sharing itinerary:', error);
            toast.error('Failed to share itinerary');
        }
    };

    // Utility Functions
    const getActivityProgress = () => {
        if (!currentTrip?.itinerary) return 0;
        
        const totalActivities = currentTrip.itinerary.reduce((total, day) => 
            total + (day.activities?.length || 0), 0);
        
        if (totalActivities === 0) return 0;
        
        return Math.round((completedActivities.size / totalActivities) * 100);
    };

    const getDayProgress = (dayNumber) => {
        const day = currentTrip?.itinerary?.find(d => d.day === dayNumber);
        if (!day?.activities) return 0;

        const dayCompleted = day.activities.filter((_, index) => 
            completedActivities.has(`${dayNumber}-${index}`)
        ).length;

        return Math.round((dayCompleted / day.activities.length) * 100);
    };

    const getEstimatedTime = (activities) => {
        if (!activities) return 0;
        return activities.reduce((total, activity) => {
            const duration = parseInt(activity.duration) || 60;
            return total + duration;
        }, 0);
    };

    const getFilteredActivities = (activities) => {
        if (activityFilter === 'all') return activities;
        return activities.filter(activity => activity.category === activityFilter);
    };

    // Load saved data on component mount
    useEffect(() => {
        if (tripId) {
            // Load completed activities
            const savedCompleted = localStorage.getItem(`trip-${tripId}-completed`);
            if (savedCompleted) {
                setCompletedActivities(new Set(JSON.parse(savedCompleted)));
            }

            // Load activity notes
            const savedNotes = localStorage.getItem(`trip-${tripId}-notes`);
            if (savedNotes) {
                setActivityNotes(JSON.parse(savedNotes));
            }
        }
    }, [tripId]);

    // ====== END COMPREHENSIVE ITINERARY FUNCTIONS ======

    const getCategoryIcon = (category) => {
        const iconMap = {
            sightseeing: <Camera size={18} className="text-blue-600 dark:text-blue-400" />,
            food: <Utensils size={18} className="text-green-600 dark:text-green-400" />,
            shopping: <ShoppingBag size={18} className="text-purple-600 dark:text-purple-400" />,
            adventure: <Navigation size={18} className="text-red-600 dark:text-red-400" />,
            relaxation: <Coffee size={18} className="text-orange-600 dark:text-orange-400" />,
            transport: <Navigation size={18} className="text-gray-600 dark:text-gray-400" />,
            accommodation: <MapPin size={18} className="text-indigo-600 dark:text-indigo-400" />,
            nightlife: <Music size={18} className="text-pink-600 dark:text-pink-400" />
        };
        return iconMap[category] || <MapPin size={18} className="text-gray-600 dark:text-gray-400" />;
    };

    const getCostBadgeColor = (budgetType) => {
        const colorMap = {
            budget: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700',
            'mid-range': 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700',
            midRange: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700',
            luxury: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700'
        };
        return colorMap[budgetType] || 'bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700';
    };

    const getPriorityColor = (priority) => {
        const colorMap = {
            high: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
            medium: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
            low: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
        };
        return colorMap[priority] || 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading trip details...</p>
                </div>
            </div>
        );
    }

    if (!currentTrip) {
        return (
            <div className="text-center py-12 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-200">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Trip not found</h3>
                <Button onClick={() => navigate('/planner')}>Back to Trip Planner</Button>
            </div>
        );
    }

    const selectedDayData = currentTrip.itinerary?.find(day => day.day === selectedDay);

    return (
        <div className="max-w-7xl mx-auto p-6 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-200">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/planner')}
                            className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <ChevronLeft size={16} />
                            Back to Planner
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{currentTrip.title}</h1>
                            <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 mt-2">
                                <div className="flex items-center gap-1">
                                    <MapPin size={16} />
                                    <span>{currentTrip.destination.city}, {currentTrip.destination.country}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar size={16} />
                                    <span>{currentTrip.dates.duration} days</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users size={16} />
                                    <span>{currentTrip.travelers.adults + currentTrip.travelers.children} travelers</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <Share2 size={16} />
                            Share
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <Download size={16} />
                            Export
                        </Button>
                        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                            <Edit size={16} />
                            Edit Trip
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { id: 'itinerary', label: 'Itinerary', icon: <Calendar size={16} /> },
                            { id: 'recommendations', label: 'Smart Recommendations', icon: <Star size={16} /> },
                            { id: 'budget', label: 'Budget Breakdown', icon: <DollarSign size={16} /> },
                            { id: 'realtime', label: 'Real-time Info', icon: <Navigation size={16} /> },
                            { id: 'route', label: 'Route Optimization', icon: <Target size={16} /> },
                            { id: 'intelligence', label: 'Travel Intelligence', icon: <Landmark size={16} /> }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'itinerary' && (
                <EnhancedItinerarySection 
                    currentTrip={currentTrip}
                    selectedDay={selectedDay}
                    setSelectedDay={setSelectedDay}
                    editMode={editMode}
                    setEditMode={setEditMode}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    activityFilter={activityFilter}
                    setActivityFilter={setActivityFilter}
                    completedActivities={completedActivities}
                    activityNotes={activityNotes}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    getCategoryIcon={getCategoryIcon}
                    getCostBadgeColor={getCostBadgeColor}
                    getPriorityColor={getPriorityColor}
                    toggleActivityCompletion={toggleActivityCompletion}
                    addActivityNote={addActivityNote}
                    addActivity={addActivity}
                    updateActivity={updateActivity}
                    deleteActivity={deleteActivity}
                    reorderActivities={reorderActivities}
                    regenerateItinerary={regenerateItinerary}
                    exportItinerary={exportItinerary}
                    shareItinerary={shareItinerary}
                    getActivityProgress={getActivityProgress}
                    getDayProgress={getDayProgress}
                    getEstimatedTime={getEstimatedTime}
                    getFilteredActivities={getFilteredActivities}
                />
            )}

            {activeTab === 'recommendations' && (
                <SmartRecommendationsTab 
                    trip={currentTrip} 
                    recommendations={recommendations}
                    onRefresh={fetchSmartRecommendations}
                />
            )}

            {activeTab === 'budget' && (
                <BudgetBreakdownTab trip={currentTrip} />
            )}

            {activeTab === 'realtime' && (
                <RealTimeInfoTab 
                    trip={currentTrip} 
                    realTimeInfo={realTimeInfo}
                    onRefresh={fetchRealTimeInfo}
                />
            )}

            {activeTab === 'route' && (
                <RouteOptimizationTab 
                    trip={currentTrip} 
                    routeData={routeData}
                    onOptimize={optimizeRoute}
                    selectedDay={selectedDay}
                />
            )}

            {activeTab === 'intelligence' && (
                <TravelIntelligenceTab trip={currentTrip} />
            )}
        </div>
    );
};

// Enhanced Itinerary Section Component
const EnhancedItinerarySection = ({
    currentTrip,
    selectedDay,
    setSelectedDay,
    editMode,
    setEditMode,
    viewMode,
    setViewMode,
    activityFilter,
    setActivityFilter,
    completedActivities,
    activityNotes,
    formatDate,
    formatTime,
    getCategoryIcon,
    getCostBadgeColor,
    getPriorityColor,
    toggleActivityCompletion,
    addActivityNote,
    addActivity,
    updateActivity,
    deleteActivity,
    reorderActivities,
    regenerateItinerary,
    exportItinerary,
    shareItinerary,
    getActivityProgress,
    getDayProgress,
    getEstimatedTime,
    getFilteredActivities
}) => {
    const [showAddActivity, setShowAddActivity] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [newActivity, setNewActivity] = useState({
        name: '',
        description: '',
        duration: 60,
        estimatedCost: { budget: 0, midRange: 0, luxury: 0 },
        category: 'sightseeing',
        priority: 'medium',
        time: '09:00'
    });

    if (!currentTrip.itinerary || currentTrip.itinerary.length === 0) {
        return (
            <div className="text-center py-12">
                <Calendar size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No itinerary available</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Generate an itinerary to start planning your trip.</p>
                <Button 
                    onClick={regenerateItinerary} 
                    className="flex items-center gap-2 mx-auto bg-blue-600 hover:bg-blue-700 text-white"
                >
                    <RefreshCw size={16} />
                    Generate Itinerary
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Trip Itinerary</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        {currentTrip.itinerary.length} days • {getActivityProgress()}% complete
                    </p>
                </div>
                
                <div className="flex items-center gap-2">
                    {/* View Mode Toggle */}
                    <div className="flex bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-2 text-sm font-medium rounded-l-lg ${
                                viewMode === 'list' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            <List size={16} className="inline mr-1" />
                            List
                        </button>
                        <button
                            onClick={() => setViewMode('timeline')}
                            className={`px-3 py-2 text-sm font-medium rounded-r-lg ${
                                viewMode === 'timeline' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            <Clock size={16} className="inline mr-1" />
                            Timeline
                        </button>
                    </div>

                    {/* Edit Mode Toggle */}
                    <Button
                        variant={editMode ? "default" : "outline"}
                        onClick={() => setEditMode(!editMode)}
                        className={`flex items-center gap-2 ${
                            editMode 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800'
                        }`}
                    >
                        <Edit size={16} />
                        {editMode ? 'Exit Edit' : 'Edit Mode'}
                    </Button>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={exportItinerary} className="flex items-center gap-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <Download size={14} />
                            Export
                        </Button>
                        <Button variant="outline" onClick={shareItinerary} className="flex items-center gap-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <Share2 size={14} />
                            Share
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filters and Day Navigation */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                {/* Activity Filter */}
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-500 dark:text-gray-400" />
                    <select
                        value={activityFilter}
                        onChange={(e) => setActivityFilter(e.target.value)}
                        className="px-3 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm"
                    >
                        <option value="all">All Activities</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="sightseeing">Sightseeing</option>
                        <option value="food">Food & Dining</option>
                        <option value="adventure">Adventure</option>
                        <option value="culture">Culture</option>
                        <option value="relaxation">Relaxation</option>
                    </select>
                </div>

                {/* Day Navigation */}
                <div className="flex items-center gap-2 ml-auto">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Day:</span>
                    <div className="flex gap-1">
                        {currentTrip.itinerary.map((day, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedDay(index)}
                                className={`px-3 py-1 text-sm rounded-md font-medium ${
                                    selectedDay === index
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setSelectedDay(null)}
                            className={`px-3 py-1 text-sm rounded-md font-medium ${
                                selectedDay === null
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            All
                        </button>
                    </div>
                </div>
            </div>

            {/* Itinerary Content */}
            <div className="space-y-6">
                {(selectedDay !== null ? [currentTrip.itinerary[selectedDay]] : currentTrip.itinerary).map((day, dayIndex) => {
                    const actualDayIndex = selectedDay !== null ? selectedDay : dayIndex;
                    const dayProgress = getDayProgress(actualDayIndex);
                    const dayActivities = getFilteredActivities(day.activities);

                    return (
                        <div key={actualDayIndex} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {/* Day Header */}
                            <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-600">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                            Day {actualDayIndex + 1}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                                            {formatDate(day.date)} • {dayActivities.length} activities
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        {/* Day Progress */}
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {dayProgress}% Complete
                                            </div>
                                            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full mt-1">
                                                <div 
                                                    className="h-full bg-green-500 rounded-full transition-all duration-300"
                                                    style={{ width: `${dayProgress}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Estimated Time */}
                                        <div className="text-right">
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                Total Time
                                            </div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {getEstimatedTime(day.activities)}
                                            </div>
                                        </div>

                                        {/* Add Activity Button */}
                                        {editMode && (
                                            <Button
                                                onClick={() => setShowAddActivity(true)}
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
                                            >
                                                <Plus size={14} />
                                                Add Activity
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Activities */}
                            <div className="p-6">
                                {dayActivities.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Calendar size={32} className="text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 dark:text-gray-400">
                                            No activities match your current filter
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {dayActivities.map((activity, activityIndex) => {
                                            const isCompleted = completedActivities.has(`${actualDayIndex}-${activityIndex}`);
                                            const activityNote = activityNotes[`${actualDayIndex}-${activityIndex}`] || '';

                                            return (
                                                <div
                                                    key={activityIndex}
                                                    className={`border rounded-lg transition-all duration-200 ${
                                                        isCompleted 
                                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                                                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                                    }`}
                                                >
                                                    <div className="p-4">
                                                        <div className="flex items-start gap-4">
                                                            {/* Completion Checkbox */}
                                                            <button
                                                                onClick={() => toggleActivityCompletion(actualDayIndex, activityIndex)}
                                                                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                                                    isCompleted
                                                                        ? 'bg-green-500 border-green-500 text-white'
                                                                        : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                                                                }`}
                                                            >
                                                                {isCompleted && <CheckCircle size={14} />}
                                                            </button>

                                                            {/* Activity Content */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-4">
                                                                    <div className="flex-1 min-w-0">
                                                                        <h4 className={`text-lg font-semibold ${
                                                                            isCompleted 
                                                                                ? 'text-green-700 dark:text-green-300 line-through' 
                                                                                : 'text-gray-900 dark:text-white'
                                                                        }`}>
                                                                            {activity.name}
                                                                        </h4>
                                                                        
                                                                        {activity.description && (
                                                                            <p className={`mt-1 text-sm ${
                                                                                isCompleted 
                                                                                    ? 'text-green-600 dark:text-green-400' 
                                                                                    : 'text-gray-600 dark:text-gray-300'
                                                                            }`}>
                                                                                {activity.description}
                                                                            </p>
                                                                        )}

                                                                        {/* Activity Details */}
                                                                        <div className="flex items-center gap-4 mt-3">
                                                                            {/* Time */}
                                                                            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                                                                <Clock size={14} />
                                                                                {formatTime(activity.time)} ({activity.duration || 60}min)
                                                                            </div>

                                                                            {/* Category */}
                                                                            <div className="flex items-center gap-1">
                                                                                {getCategoryIcon(activity.category)}
                                                                                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                                                                    {activity.category}
                                                                                </span>
                                                                            </div>

                                                                            {/* Priority */}
                                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(activity.priority)}`}>
                                                                                {activity.priority}
                                                                            </span>

                                                                            {/* Cost */}
                                                                            {activity.estimatedCost && (
                                                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCostBadgeColor(activity.estimatedCost.budget)}`}>
                                                                                    {formatCurrency(
                                                                                        activity.estimatedCost.budget,
                                                                                        currentTrip.preferences?.currency || 'USD'
                                                                                    )}
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        {/* Location */}
                                                                        {activity.location && (
                                                                            <div className="flex items-center gap-1 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                                                <MapPin size={14} />
                                                                                {typeof activity.location === 'string' ? activity.location : activity.location.name}
                                                                            </div>
                                                                        )}

                                                                        {/* Activity Note */}
                                                                        {activityNote && (
                                                                            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md">
                                                                                <div className="flex items-start gap-2">
                                                                                    <StickyNote size={14} className="text-yellow-600 dark:text-yellow-400 mt-0.5" />
                                                                                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                                                                        {activityNote}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Edit Mode Actions */}
                                                                    {editMode && (
                                                                        <div className="flex items-center gap-1">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => setSelectedActivity({ dayIndex: actualDayIndex, activityIndex, activity })}
                                                                                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                            >
                                                                                <Edit size={14} />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => deleteActivity(actualDayIndex, activityIndex)}
                                                                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => addActivityNote(actualDayIndex, activityIndex)}
                                                                                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                            >
                                                                                <StickyNote size={14} />
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Global Actions */}
            <div className="flex items-center justify-center gap-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <Button
                    onClick={regenerateItinerary}
                    variant="outline"
                    className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
                >
                    <RefreshCw size={16} />
                    Regenerate Itinerary
                </Button>
                <Button
                    onClick={() => setShowAddActivity(true)}
                    className="flex items-center gap-2"
                >
                    <Plus size={16} />
                    Add Custom Activity
                </Button>
            </div>

            {/* Add Activity Modal */}
            {showAddActivity && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Add New Activity
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Activity Name
                                </label>
                                <input
                                    type="text"
                                    value={newActivity.name}
                                    onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Enter activity name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={newActivity.description}
                                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Enter description"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Time
                                    </label>
                                    <input
                                        type="time"
                                        value={newActivity.time}
                                        onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Duration (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        value={newActivity.duration}
                                        onChange={(e) => setNewActivity({ ...newActivity, duration: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        min="15"
                                        step="15"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={newActivity.category}
                                        onChange={(e) => setNewActivity({ ...newActivity, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="sightseeing">Sightseeing</option>
                                        <option value="food">Food & Dining</option>
                                        <option value="adventure">Adventure</option>
                                        <option value="culture">Culture</option>
                                        <option value="relaxation">Relaxation</option>
                                        <option value="shopping">Shopping</option>
                                        <option value="transport">Transport</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Priority
                                    </label>
                                    <select
                                        value={newActivity.priority}
                                        onChange={(e) => setNewActivity({ ...newActivity, priority: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Estimated Cost ($)
                                </label>
                                <input
                                    type="number"
                                    value={newActivity.estimatedCost.budget}
                                    onChange={(e) => setNewActivity({
                                        ...newActivity,
                                        estimatedCost: {
                                            budget: parseInt(e.target.value) || 0,
                                            midRange: Math.round((parseInt(e.target.value) || 0) * 1.5),
                                            luxury: Math.round((parseInt(e.target.value) || 0) * 2.5)
                                        }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    min="0"
                                    placeholder="Enter budget cost"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-6">
                            <Button
                                onClick={() => {
                                    addActivity(selectedDay || 0, newActivity);
                                    setNewActivity({
                                        name: '',
                                        description: '',
                                        duration: 60,
                                        estimatedCost: { budget: 0, midRange: 0, luxury: 0 },
                                        category: 'sightseeing',
                                        priority: 'medium',
                                        time: '09:00'
                                    });
                                    setShowAddActivity(false);
                                }}
                                disabled={!newActivity.name.trim()}
                                className="flex-1"
                            >
                                Add Activity
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowAddActivity(false)}
                                className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Activity Modal */}
            {selectedActivity && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Edit Activity
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Activity Name
                                </label>
                                <input
                                    type="text"
                                    value={selectedActivity.activity.name}
                                    onChange={(e) => setSelectedActivity({
                                        ...selectedActivity,
                                        activity: { ...selectedActivity.activity, name: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={selectedActivity.activity.description || ''}
                                    onChange={(e) => setSelectedActivity({
                                        ...selectedActivity,
                                        activity: { ...selectedActivity.activity, description: e.target.value }
                                    })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Time
                                    </label>
                                    <input
                                        type="time"
                                        value={selectedActivity.activity.time || '09:00'}
                                        onChange={(e) => setSelectedActivity({
                                            ...selectedActivity,
                                            activity: { ...selectedActivity.activity, time: e.target.value }
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Duration (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        value={selectedActivity.activity.duration || 60}
                                        onChange={(e) => setSelectedActivity({
                                            ...selectedActivity,
                                            activity: { ...selectedActivity.activity, duration: parseInt(e.target.value) }
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        min="15"
                                        step="15"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-6">
                            <Button
                                onClick={() => {
                                    updateActivity(selectedActivity.dayIndex, selectedActivity.activityIndex, selectedActivity.activity);
                                    setSelectedActivity(null);
                                }}
                                className="flex-1"
                            >
                                Save Changes
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setSelectedActivity(null)}
                                className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Smart Recommendations Component
const SmartRecommendationsTab = ({ trip, recommendations, onRefresh }) => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('rating');

    console.log('SmartRecommendationsTab rendered with:', { trip: trip?.title, recommendations });

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Smart Recommendations</h2>
                    <p className="text-gray-600">
                        Personalized suggestions based on your interests and travel style
                    </p>
                </div>
                <Button onClick={onRefresh} className="flex items-center gap-2 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white">
                    <Star size={16} />
                    Refresh Recommendations
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by:</span>
                </div>
                <div className="flex gap-2">
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'restaurants', label: 'Restaurants' },
                        { id: 'attractions', label: 'Attractions' },
                        { id: 'events', label: 'Events' },
                        { id: 'hiddenGems', label: 'Hidden Gems' },
                        { id: 'shopping', label: 'Shopping' }
                    ].map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                selectedCategory === category.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                            }`}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>
            </div>

            <EnhancedRecommendationsList 
                recommendations={recommendations} 
                selectedCategory={selectedCategory}
                trip={trip}
            />
        </div>
    );
};

// Enhanced Recommendations List Component
const EnhancedRecommendationsList = ({ recommendations, selectedCategory, trip }) => {
    console.log('EnhancedRecommendationsList received:', { recommendations, selectedCategory });
    
    const getRecommendationIcon = (category) => {
        const iconMap = {
            restaurants: <Utensils size={20} className="text-green-600" />,
            attractions: <Camera size={20} className="text-blue-600" />,
            events: <PartyPopper size={20} className="text-purple-600" />,
            hiddenGems: <Eye size={20} className="text-amber-600" />,
            shopping: <ShoppingBag size={20} className="text-pink-600" />
        };
        return iconMap[category] || <Star size={20} className="text-gray-600" />;
    };

    const getCostBadgeColor = (priceRange) => {
        const colorMap = {
            budget: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700',
            midRange: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700',
            luxury: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700'
        };
        return colorMap[priceRange] || 'bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700';
    };

    const getStarRating = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star 
                key={i} 
                size={14} 
                className={i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
            />
        ));
    };

    const categoriesToShow = selectedCategory === 'all' 
        ? ['restaurants', 'attractions', 'events', 'hiddenGems', 'shopping'] 
        : [selectedCategory];

    console.log('Categories to show:', categoriesToShow);
    console.log('Available recommendation categories:', Object.keys(recommendations || {}));
    console.log('Selected category:', selectedCategory);
    console.log('Full recommendations object:', recommendations);

    // Check if recommendations is empty or all categories are empty
    const hasAnyRecommendations = categoriesToShow.some(category => 
        recommendations[category] && recommendations[category].length > 0
    );

    if (!recommendations || Object.keys(recommendations).length === 0) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading recommendations...</p>
            </div>
        );
    }

    if (!hasAnyRecommendations) {
        return (
            <div className="text-center py-12">
                <Star size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No recommendations available</h3>
                <p className="text-gray-600 dark:text-gray-400">Click "Refresh Recommendations" to generate new suggestions.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {categoriesToShow.map((category) => {
                const items = recommendations[category] || [];
                console.log(`Category ${category}:`, items.length, 'items');
                console.log(`Items for ${category}:`, items);
                if (items.length === 0) {
                    console.log(`No items found for category: ${category}`);
                    return (
                        <div key={category} className="text-center py-4 border border-gray-200 rounded-lg">
                            <p className="text-gray-500">No {category} recommendations available</p>
                        </div>
                    );
                }

                return (
                    <div key={category}>
                        <div className="flex items-center gap-3 mb-4">
                            {getRecommendationIcon(category)}
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                                {category === 'hiddenGems' ? 'Hidden Gems' : category}
                            </h3>
                            <Badge variant="secondary" className="ml-2">
                                {items.length} recommendations
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.map((item, index) => (
                                <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                    {/* Header with rating and price */}
                                    <div className="p-6 pb-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                                    {item.name}
                                                </h4>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex items-center gap-1">
                                                        {getStarRating(item.rating)}
                                                    </div>
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        {item.rating}
                                                    </span>
                                                </div>
                                            </div>
                                            <Badge className={getCostBadgeColor(item.priceRange)}>
                                                {item.priceRange}
                                            </Badge>
                                        </div>

                                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 leading-relaxed">
                                            {item.description}
                                        </p>

                                        {/* Location and details */}
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <MapPin size={14} />
                                                <span>
                                                    {typeof item.location === 'string' 
                                                        ? item.location 
                                                        : 'Location not specified'
                                                    }
                                                </span>
                                            </div>

                                            {item.openingHours && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <Clock size={14} />
                                                    <span>{item.openingHours}</span>
                                                </div>
                                            )}

                                            {item.duration && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <Clock size={14} />
                                                    <span>{item.duration}</span>
                                                </div>
                                            )}

                                            {item.schedule && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <Calendar size={14} />
                                                    <span>{item.schedule}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Enhanced details */}
                                        {item.insider_tip && (
                                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 mb-3">
                                                <p className="text-amber-800 dark:text-amber-200 text-sm">
                                                    <strong>💡 Insider Tip:</strong> {item.insider_tip}
                                                </p>
                                            </div>
                                        )}

                                        {item.whySpecial && (
                                            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-3 mb-3">
                                                <p className="text-purple-800 dark:text-purple-200 text-sm">
                                                    <strong>✨ What makes it special:</strong> {item.whySpecial}
                                                </p>
                                            </div>
                                        )}

                                        {/* Specialties */}
                                        {(item.specialties || item.best_dishes) && (
                                            <div className="mb-3">
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    {category === 'restaurants' ? '🍽️ Must Try:' : '🌟 Specialties:'}
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {(item.specialties || item.best_dishes)?.slice(0, 3).map((specialty, i) => (
                                                        <Badge key={i} variant="secondary" className="text-xs">
                                                            {specialty}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Tags */}
                                        {item.tags && (
                                            <div className="mb-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {item.tags.slice(0, 4).map((tag, i) => (
                                                        <Badge key={i} variant="outline" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Cost information */}
                                        <div className="flex items-center justify-between mb-4">
                                            {(item.averageCost || item.entranceFee || item.ticketPrice) && (
                                                <div className="flex items-center gap-1">
                                                    <DollarSign size={14} className="text-green-600" />
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        ${typeof (item.averageCost || item.entranceFee || item.ticketPrice) === 'number' 
                                                            ? (item.averageCost || item.entranceFee || item.ticketPrice)
                                                            : typeof (item.averageCost || item.entranceFee || item.ticketPrice) === 'string'
                                                                ? (item.averageCost || item.entranceFee || item.ticketPrice)
                                                                : 'Free'}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {item.bestTimeToVisit && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    Best: {item.bestTimeToVisit}
                                                </div>
                                            )}
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="flex-1 text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                📍 View Location
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="flex-1 text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                ➕ Add to Trip
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <Heart size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* Local etiquette and transportation tips */}
            {recommendations.local_etiquette && (
                <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
                    <h4 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-4">🤝 Local Etiquette</h4>
                    <ul className="space-y-2">
                        {recommendations.local_etiquette.map((tip, index) => (
                            <li key={index} className="text-blue-800 dark:text-blue-200 text-sm flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {recommendations.transportation_hacks && (
                <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
                    <h4 className="text-lg font-bold text-green-900 dark:text-green-100 mb-4">🚇 Transportation Hacks</h4>
                    <div className="space-y-3">
                        {recommendations.transportation_hacks.map((hack, index) => (
                            <div key={index} className="text-green-800 dark:text-green-200 text-sm">
                                <p><strong>{hack.type}:</strong> {hack.tip}</p>
                                {hack.money_saver && (
                                    <p className="text-green-600 dark:text-green-400 mt-1">💰 {hack.money_saver}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Budget Breakdown Component
const BudgetBreakdownTab = ({ trip }) => {
    if (!trip.totalEstimatedCost) {
        return (
            <div className="text-center py-12">
                <DollarSign size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Budget not calculated</h3>
                <p className="text-gray-600">Generate an itinerary to see budget breakdown.</p>
            </div>
        );
    }

    const budgetTypes = ['budget', 'midRange', 'luxury'];
    const categories = ['accommodation', 'food', 'activities', 'transport'];

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Budget Breakdown</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {budgetTypes.map((budgetType) => (
                    <div key={budgetType} className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="text-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 capitalize mb-2">
                                {budgetType === 'midRange' ? 'Mid-Range' : budgetType}
                            </h3>
                            <div className="text-3xl font-bold text-blue-600">
                                {formatCurrency(
                                    trip.totalEstimatedCost[budgetType]?.total || 0,
                                    trip.preferences?.currency || 'USD'
                                )}
                            </div>
                            <p className="text-sm text-gray-600">Total estimated cost</p>
                        </div>
                        
                        <div className="space-y-3">
                            {categories.map((category) => (
                                <div key={category} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 capitalize">{category}</span>
                                    <span className="font-medium">
                                        {formatCurrency(
                                            trip.totalEstimatedCost[budgetType]?.[category] || 0,
                                            trip.preferences?.currency || 'USD'
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Recommendations List Component
const RecommendationsList = ({ recommendations, selectedCategory, trip }) => {
    // Get category icon
    const getCategoryIcon = (type) => {
        switch (type) {
            case 'restaurants':
                return <Utensils size={16} className="text-green-600" />;
            case 'attractions':
                return <Landmark size={16} className="text-blue-600" />;
            case 'events':
                return <PartyPopper size={16} className="text-purple-600" />;
            case 'hiddenGems':
                return <Eye size={16} className="text-orange-600" />;
            case 'shopping':
                return <ShoppingBag size={16} className="text-pink-600" />;
            default:
                return <Target size={16} className="text-gray-600" />;
        }
    };

    // Filter recommendations based on selected category
    const getFilteredRecommendations = () => {
        if (selectedCategory === 'all') {
            return Object.entries(recommendations).flatMap(([type, items]) => 
                items.map(item => ({ ...item, type }))
            );
        }
        return recommendations[selectedCategory] || [];
    };

    const filteredRecommendations = getFilteredRecommendations();

    if (filteredRecommendations.length === 0) {
        return (
            <div className="text-center py-12">
                <Star size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No recommendations yet</h3>
                <p className="text-gray-600">Click "Refresh Recommendations" to get personalized suggestions.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecommendations.map((item, index) => (
                <div key={`${item.type}-${index}`} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        {getCategoryIcon(item.type)}
                    </div>
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                            <div className="flex items-center gap-1">
                                <Star size={14} className="text-yellow-500 fill-current" />
                                <span className="text-sm text-gray-600">{item.rating}</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                        
                        {/* Location and Price */}
                        <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                                <MapPin size={12} />
                                <span>
                                    {typeof item.location === 'string' 
                                        ? item.location 
                                        : 'Location not specified'
                                    }
                                </span>
                            </div>
                            {item.priceRange && (
                                <div className="flex items-center gap-1">
                                    <DollarSign size={12} />
                                    <span className="capitalize">{item.priceRange.replace(/([A-Z])/g, ' $1').trim()}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                                {item.tags?.slice(0, 2).map((tag, tagIndex) => (
                                    <Badge key={tagIndex} variant="secondary" className="text-xs">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                            <Button size="sm" variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                                Add to Trip
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Real-time Information Component
const RealTimeInfoTab = ({ trip, realTimeInfo, onRefresh }) => {
    const handleRefresh = () => {
        console.log('Real-time info refresh button clicked');
        onRefresh();
    };

    if (!realTimeInfo) {
        return (
            <div className="text-center py-12">
                <Navigation size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No real-time data</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Get current weather, traffic, and local updates for your destination.</p>
                <Button onClick={handleRefresh} className="flex items-center gap-2">
                    <Navigation size={16} />
                    Get Real-time Info
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Real-time Information</h2>
                <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Navigation size={16} />
                    Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Weather Card */}
                {realTimeInfo.weather && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Star size={20} className="text-yellow-500" />
                            Current Weather
                        </h3>
                        <div className="space-y-3">
                            <div className="text-3xl font-bold text-blue-600">
                                {realTimeInfo.weather.current.temperature}
                            </div>
                            <div className="text-gray-600">{realTimeInfo.weather.current.condition}</div>
                            <div className="text-sm text-gray-500">
                                Humidity: {realTimeInfo.weather.current.humidity} | 
                                Wind: {realTimeInfo.weather.current.windSpeed}
                            </div>
                        </div>
                    </div>
                )}

                {/* Traffic Card */}
                {realTimeInfo.transportation && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Navigation size={20} className="text-blue-500" />
                            Transportation
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <span className="text-sm font-medium">Public Transport: </span>
                                <Badge variant={realTimeInfo.transportation.publicTransport.status === 'operational' ? 'default' : 'destructive'}>
                                    {realTimeInfo.transportation.publicTransport.status}
                                </Badge>
                            </div>
                            <div>
                                <span className="text-sm font-medium">Traffic: </span>
                                <span className="text-gray-600">{realTimeInfo.transportation.traffic.currentCondition}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Safety Alerts Card */}
                {realTimeInfo.safetyAlerts && realTimeInfo.safetyAlerts.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Target size={20} className="text-red-500" />
                            Safety Alerts
                        </h3>
                        <div className="space-y-2">
                            {realTimeInfo.safetyAlerts.map((alert, index) => (
                                <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                                    <div className="font-medium text-yellow-800">{alert.type}</div>
                                    <div className="text-sm text-yellow-700">{alert.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Local Events */}
            {realTimeInfo.localEvents && realTimeInfo.localEvents.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Local Events</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {realTimeInfo.localEvents.map((event, index) => (
                            <div key={index} className="p-4 border border-gray-100 rounded-lg">
                                <div className="font-medium">{event.name}</div>
                                <div className="text-sm text-gray-600">{event.date} • {event.type}</div>
                                <div className="text-sm text-gray-500 mt-1">{event.description}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Route Optimization Component
const RouteOptimizationTab = ({ trip, routeData, onOptimize, selectedDay }) => {
    const [optimizing, setOptimizing] = useState(false);

    const handleOptimize = async () => {
        setOptimizing(true);
        await onOptimize(selectedDay);
        setOptimizing(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Route Optimization</h2>
                    <p className="text-gray-600">Optimize your daily routes for minimum travel time and maximum efficiency.</p>
                </div>
                <Button 
                    onClick={handleOptimize} 
                    disabled={optimizing}
                    className="flex items-center gap-2"
                >
                    <Target size={16} />
                    {optimizing ? 'Optimizing...' : 'Optimize Route'}
                </Button>
            </div>

            {/* Day Selection */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Select Day to Optimize</h3>
                <div className="flex gap-2 flex-wrap">
                    {trip.itinerary?.map((day) => (
                        <Button
                            key={day.day}
                            variant={selectedDay === day.day ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedDay(day.day)}
                        >
                            Day {day.day}
                        </Button>
                    ))}
                </div>
            </div>

            {routeData ? (
                <div className="space-y-6">
                    {/* Route Summary */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">Route Summary</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{routeData.routeSummary.totalDistance}</div>
                                <div className="text-sm text-gray-600">Total Distance</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{routeData.routeSummary.totalTravelTime}</div>
                                <div className="text-sm text-gray-600">Travel Time</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">{routeData.routeSummary.startTime}</div>
                                <div className="text-sm text-gray-600">Start Time</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">{routeData.routeSummary.endTime}</div>
                                <div className="text-sm text-gray-600">End Time</div>
                            </div>
                        </div>
                    </div>

                    {/* Optimized Route */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">Optimized Route</h3>
                        <div className="space-y-4">
                            {routeData.optimizedRoute.map((stop, index) => (
                                <div key={index} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg">
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                        {stop.order}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="font-medium">{stop.location}</div>
                                        <div className="text-sm text-gray-600">{stop.address}</div>
                                        <div className="text-sm text-gray-500">
                                            {stop.arrivalTime} - {stop.departureTime} ({stop.duration})
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {stop.travelTimeToNext && `${stop.travelTimeToNext} to next`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Optimizations Made */}
                    {routeData.routeOptimizations && routeData.routeOptimizations.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4">Optimizations Made</h3>
                            <div className="space-y-3">
                                {routeData.routeOptimizations.map((optimization, index) => (
                                    <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="font-medium text-green-800">{optimization.type}</div>
                                        <div className="text-sm text-green-700">{optimization.description}</div>
                                        <div className="text-sm text-green-600 mt-1">{optimization.benefit}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-12">
                    <Target size={48} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No route optimized yet</h3>
                    <p className="text-gray-600">Click "Optimize Route" to get the most efficient path for your selected day.</p>
                </div>
            )}
        </div>
    );
};

// Travel Intelligence Component
const TravelIntelligenceTab = ({ trip }) => {
    const travelIntelligence = trip.travel_intelligence || {};

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    🧠 Travel Intelligence
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Expert insights and local knowledge for your trip to {trip.destination.city}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Best Time to Visit */}
                {travelIntelligence.best_time_to_visit && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Calendar className="text-white" size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">Best Time to Visit</h3>
                        </div>
                        <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                            {travelIntelligence.best_time_to_visit}
                        </p>
                    </div>
                )}

                {/* Cultural Etiquette */}
                {travelIntelligence.cultural_etiquette && (
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                                <Users className="text-white" size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100">Cultural Etiquette</h3>
                        </div>
                        <p className="text-purple-800 dark:text-purple-200 leading-relaxed">
                            {travelIntelligence.cultural_etiquette}
                        </p>
                    </div>
                )}

                {/* Packing Essentials */}
                {travelIntelligence.packing_essentials && (
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                <ShoppingBag className="text-white" size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-green-900 dark:text-green-100">Packing Essentials</h3>
                        </div>
                        <p className="text-green-800 dark:text-green-200 leading-relaxed">
                            {travelIntelligence.packing_essentials}
                        </p>
                    </div>
                )}

                {/* Language Basics */}
                {travelIntelligence.language_basics && (
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
                                <Music className="text-white" size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100">Language Basics</h3>
                        </div>
                        <p className="text-amber-800 dark:text-amber-200 leading-relaxed">
                            {travelIntelligence.language_basics}
                        </p>
                    </div>
                )}

                {/* Currency & Payment */}
                {travelIntelligence.currency_wisdom && (
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                                <DollarSign className="text-white" size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">Currency & Payment</h3>
                        </div>
                        <p className="text-emerald-800 dark:text-emerald-200 leading-relaxed">
                            {travelIntelligence.currency_wisdom}
                        </p>
                    </div>
                )}

                {/* Safety Insights */}
                {travelIntelligence.safety_insights && (
                    <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                                <Heart className="text-white" size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-red-900 dark:text-red-100">Safety Insights</h3>
                        </div>
                        <p className="text-red-800 dark:text-red-200 leading-relaxed">
                            {travelIntelligence.safety_insights}
                        </p>
                    </div>
                )}
            </div>

            {/* Local Apps and Hidden Gems */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {travelIntelligence.local_apps && (
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border border-indigo-200 dark:border-indigo-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <Camera className="text-white" size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">Essential Local Apps</h3>
                        </div>
                        <p className="text-indigo-800 dark:text-indigo-200 leading-relaxed">
                            {travelIntelligence.local_apps}
                        </p>
                    </div>
                )}

                {travelIntelligence.hidden_gems && (
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border border-pink-200 dark:border-pink-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center">
                                <Eye className="text-white" size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-pink-900 dark:text-pink-100">Hidden Gems</h3>
                        </div>
                        <p className="text-pink-800 dark:text-pink-200 leading-relaxed">
                            {travelIntelligence.hidden_gems}
                        </p>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mt-8">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📱 Travel Preparation</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button variant="outline" className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Download size={16} />
                        Download Offline Map
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Share2 size={16} />
                        Share Travel Tips
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Camera size={16} />
                        Save to Notes
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TripDetailView;
