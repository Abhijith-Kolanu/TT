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
    Target
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import { setCurrentTrip, setLoading } from '@/redux/tripSlice';

const TripDetailView = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentTrip, loading } = useSelector(store => store.trip);
    const [selectedDay, setSelectedDay] = useState(1);
    const [activeTab, setActiveTab] = useState('itinerary'); // itinerary, recommendations, budget, realtime, route
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
                    setSelectedDay(1);
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
            const response = await axios.get(`http://localhost:8000/api/v1/trip/${tripId}/recommendations`, {
                withCredentials: true
            });
            
            if (response.data.success) {
                setRecommendations(response.data.recommendations);
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            toast.error('Failed to fetch recommendations');
        }
    };

    const fetchRealTimeInfo = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/v1/trip/${tripId}/realtime`, {
                withCredentials: true
            });
            
            if (response.data.success) {
                setRealTimeInfo(response.data.realTimeInfo);
            }
        } catch (error) {
            console.error('Error fetching real-time info:', error);
            toast.error('Failed to fetch real-time information');
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

    const getCategoryIcon = (category) => {
        const iconMap = {
            sightseeing: <Camera size={16} className="text-blue-600" />,
            food: <Utensils size={16} className="text-green-600" />,
            shopping: <ShoppingBag size={16} className="text-purple-600" />,
            adventure: <Navigation size={16} className="text-red-600" />,
            relaxation: <Coffee size={16} className="text-orange-600" />,
            transport: <Navigation size={16} className="text-gray-600" />,
            accommodation: <MapPin size={16} className="text-indigo-600" />
        };
        return iconMap[category] || <MapPin size={16} className="text-gray-600" />;
    };

    const getCostBadgeColor = (budgetType) => {
        const colorMap = {
            budget: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
            'mid-range': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
            luxury: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
        };
        return colorMap[budgetType] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
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
                        <Button variant="outline" className="flex items-center gap-2">
                            <Share2 size={16} />
                            Share
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Download size={16} />
                            Export
                        </Button>
                        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                            <Edit size={16} />
                            Edit Trip
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { id: 'itinerary', label: 'Itinerary', icon: <Calendar size={16} /> },
                            { id: 'recommendations', label: 'Smart Recommendations', icon: <Star size={16} /> },
                            { id: 'budget', label: 'Budget Breakdown', icon: <DollarSign size={16} /> },
                            { id: 'realtime', label: 'Real-time Info', icon: <Navigation size={16} /> },
                            { id: 'route', label: 'Route Optimization', icon: <Target size={16} /> }
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
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Day Selector */}
                    <div className="lg:col-span-1">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Select Day</h3>
                        <div className="space-y-2">
                            {currentTrip.itinerary?.map((day) => (
                                <button
                                    key={day.day}
                                    onClick={() => setSelectedDay(day.day)}
                                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                        selectedDay === day.day
                                            ? 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-900 dark:text-blue-200'
                                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                                    }`}
                                >
                                    <div className="font-medium">Day {day.day}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {formatDate(day.date)}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {day.activities?.length || 0} activities
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Day Details */}
                    <div className="lg:col-span-3">
                        {selectedDayData ? (
                            <div>
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        Day {selectedDayData.day}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400">{formatDate(selectedDayData.date)}</p>
                                </div>

                                <div className="space-y-4">
                                    {selectedDayData.activities?.map((activity, index) => (
                                        <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-300 font-medium text-sm">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Clock size={16} className="text-gray-500 dark:text-gray-400" />
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {formatTime(activity.time)}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                            {activity.title}
                                                        </h3>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {getCategoryIcon(activity.category)}
                                                    <Badge className={getCostBadgeColor(currentTrip.preferences.budgetType)}>
                                                        ${activity.estimatedCost?.[currentTrip.preferences.budgetType]}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <p className="text-gray-600 dark:text-gray-400 mb-4">{activity.description}</p>

                                            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin size={14} />
                                                        <span>{activity.location?.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock size={14} />
                                                        <span>{activity.estimatedDuration} minutes</span>
                                                    </div>
                                                </div>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    View on Map
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Calendar size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No activities for this day</h3>
                                <p className="text-gray-600 dark:text-gray-400">Select a different day to view the itinerary.</p>
                            </div>
                        )}
                    </div>
                </div>
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
        </div>
    );
};

// Smart Recommendations Component
const SmartRecommendationsTab = ({ trip, recommendations, onRefresh }) => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('rating');

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Smart Recommendations</h2>
                    <p className="text-gray-600">
                        Personalized suggestions based on your interests and travel style
                    </p>
                </div>
                <Button onClick={onRefresh} className="flex items-center gap-2">
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

            <RecommendationsList 
                recommendations={recommendations} 
                selectedCategory={selectedCategory}
                trip={trip}
            />
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
                                ${trip.totalEstimatedCost[budgetType]?.total?.toLocaleString() || 0}
                            </div>
                            <p className="text-sm text-gray-600">Total estimated cost</p>
                        </div>
                        
                        <div className="space-y-3">
                            {categories.map((category) => (
                                <div key={category} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 capitalize">{category}</span>
                                    <span className="font-medium">
                                        ${trip.totalEstimatedCost[budgetType]?.[category]?.toLocaleString() || 0}
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
                                <span>{item.location}</span>
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
                            <Button size="sm" variant="outline" className="text-xs">
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
    if (!realTimeInfo) {
        return (
            <div className="text-center py-12">
                <Navigation size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No real-time data</h3>
                <p className="text-gray-600 mb-4">Get current weather, traffic, and local updates for your destination.</p>
                <Button onClick={onRefresh} className="flex items-center gap-2">
                    <Navigation size={16} />
                    Get Real-time Info
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Real-time Information</h2>
                <Button onClick={onRefresh} variant="outline" className="flex items-center gap-2">
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

export default TripDetailView;
