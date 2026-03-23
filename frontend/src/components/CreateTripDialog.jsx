import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { MapPin, Calendar, Users, DollarSign, Plus, Minus, Plane, Heart, Globe, Zap } from 'lucide-react';

const CreateTripDialog = ({ open, onClose, onSubmit }) => {
    const popularDestinations = useMemo(() => ([
        { city: 'Paris', country: 'France', coordinates: [2.3522, 48.8566] },
        { city: 'Tokyo', country: 'Japan', coordinates: [139.6917, 35.6895] },
        { city: 'New York', country: 'USA', coordinates: [-74.006, 40.7128] },
        { city: 'London', country: 'UK', coordinates: [-0.1276, 51.5074] },
        { city: 'Rome', country: 'Italy', coordinates: [12.4964, 41.9028] },
        { city: 'Barcelona', country: 'Spain', coordinates: [2.1734, 41.3851] },
        { city: 'Amsterdam', country: 'Netherlands', coordinates: [4.9041, 52.3676] },
        { city: 'Bangkok', country: 'Thailand', coordinates: [100.5018, 13.7563] },
        { city: 'Sydney', country: 'Australia', coordinates: [151.2093, -33.8688] },
        { city: 'Dubai', country: 'UAE', coordinates: [55.2708, 25.2048] },
        { city: 'Singapore', country: 'Singapore', coordinates: [103.8198, 1.3521] },
        { city: 'Istanbul', country: 'Turkey', coordinates: [28.9784, 41.0082] }
    ]), []);

    const [formData, setFormData] = useState({
        title: '',
        destinationQuery: '',
        destination: {
            city: '',
            country: '',
            coordinates: [0, 0]
        },
        dates: {
            startDate: '',
            endDate: ''
        },
        travelers: {
            adults: 1,
            children: 0
        },
        preferences: {
            budgetType: 'mid-range',
            currency: 'USD',
            interests: [],
            travelStyle: 'solo',
            pace: 'moderate'
        }
    });

    const [errors, setErrors] = useState({});
    const [showSuggestions, setShowSuggestions] = useState(false);

    const budgetOptions = [
        { id: 'budget',    label: 'Budget',    sub: 'Economical',  emoji: '💰' },
        { id: 'mid-range', label: 'Mid-Range', sub: 'Balanced',    emoji: '💳' },
        { id: 'luxury',    label: 'Luxury',    sub: 'Premium',     emoji: '💎' },
    ];

    const travelStyleOptions = [
        { id: 'solo', label: 'Solo', emoji: '🧍' },
        { id: 'couple', label: 'Couple', emoji: '💑' },
        { id: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
        { id: 'friends', label: 'Friends', emoji: '👯' },
        { id: 'business', label: 'Business', emoji: '💼' }
    ];

    const paceOptions = [
        { id: 'relaxed', label: 'Relaxed', sub: 'Plenty of downtime', emoji: '🌅' },
        { id: 'moderate', label: 'Moderate', sub: 'Balanced schedule', emoji: '⚖️' },
        { id: 'packed', label: 'Packed', sub: 'See everything', emoji: '⚡' }
    ];

    const interests = [
        { id: 'culture', label: 'Culture', emoji: '🏛️' },
        { id: 'history', label: 'History', emoji: '📜' },
        { id: 'food', label: 'Food', emoji: '🍜' },
        { id: 'adventure', label: 'Adventure', emoji: '🧗' },
        { id: 'relaxation', label: 'Relaxation', emoji: '🧘' },
        { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
        { id: 'nightlife', label: 'Nightlife', emoji: '🎉' },
        { id: 'nature', label: 'Nature', emoji: '🌿' },
        { id: 'art', label: 'Art', emoji: '🎨' },
        { id: 'museums', label: 'Museums', emoji: '🗿' }
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    const handleNestedInputChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
        }));
        const errorKey = `${parent}.${field}`;
        if (errors[errorKey]) {
            setErrors(prev => ({
                ...prev,
                [errorKey]: null
            }));
        }
    };

    const destinationSuggestions = useMemo(() => {
        const q = String(formData.destinationQuery || '').trim().toLowerCase();
        if (!q) return popularDestinations.slice(0, 8);
        return popularDestinations
            .filter(item => `${item.city}, ${item.country}`.toLowerCase().includes(q))
            .slice(0, 8);
    }, [formData.destinationQuery, popularDestinations]);

    const handleDestinationInput = (value) => {
        setFormData(prev => ({
            ...prev,
            destinationQuery: value,
            destination: {
                ...prev.destination,
                city: '',
                country: '',
                coordinates: [0, 0]
            }
        }));
        setShowSuggestions(true);
        if (errors.destinationQuery) {
            setErrors(prev => ({ ...prev, destinationQuery: null }));
        }
    };

    const applyDestinationSuggestion = (item) => {
        setFormData(prev => ({
            ...prev,
            destinationQuery: `${item.city}, ${item.country}`,
            destination: {
                city: item.city,
                country: item.country,
                coordinates: item.coordinates
            }
        }));
        setShowSuggestions(false);
    };

    const handleInterestToggle = (interestId) => {
        setFormData(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                interests: prev.preferences.interests.includes(interestId)
                    ? prev.preferences.interests.filter(i => i !== interestId)
                    : [...prev.preferences.interests, interestId]
            }
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!String(formData.title || '').trim()) {
            newErrors.title = 'Trip title is required';
        }

        if (!String(formData.destinationQuery).trim()) {
            newErrors.destinationQuery = 'Destination is required';
        }

        if (!formData.dates.startDate) {
            newErrors['dates.startDate'] = 'Start date is required';
        }

        if (!formData.dates.endDate) {
            newErrors['dates.endDate'] = 'End date is required';
        }

        if (formData.dates.startDate && formData.dates.endDate) {
            const startDate = new Date(formData.dates.startDate);
            const endDate = new Date(formData.dates.endDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (startDate < today) {
                newErrors['dates.startDate'] = 'Start date cannot be in the past';
            }

            if (endDate <= startDate) {
                newErrors['dates.endDate'] = 'End date must be after start date';
            }
        }

        if (formData.travelers.adults < 1) {
            newErrors['travelers.adults'] = 'At least 1 adult traveler is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resolveDestination = () => {
        if (formData.destination.city && formData.destination.country) {
            return formData.destination;
        }

        const raw = String(formData.destinationQuery || '').trim();
        const [cityRaw, ...countryParts] = raw.split(',').map(p => p.trim()).filter(Boolean);
        const city = cityRaw || raw;
        const country = countryParts.join(', ') || 'Unknown';

        const matched = popularDestinations.find(item => item.city.toLowerCase() === city.toLowerCase() && item.country.toLowerCase() === country.toLowerCase())
            || popularDestinations.find(item => item.city.toLowerCase() === city.toLowerCase());

        return {
            city,
            country,
            coordinates: matched?.coordinates || [0, 0]
        };
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const destination = resolveDestination();
        const title = String(formData.title || '').trim();
        
        const tripData = {
            title,
            destination,
            dates: {
                startDate: formData.dates.startDate,
                endDate: formData.dates.endDate
            },
            travelers: {
                adults: formData.travelers.adults,
                children: formData.travelers.children
            },
            preferences: {
                budgetType: formData.preferences.budgetType,
                currency: formData.preferences.currency,
                interests: formData.preferences.interests,
                travelStyle: formData.preferences.travelStyle,
                pace: formData.preferences.pace
            }
        };

        onSubmit(tripData);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            destinationQuery: '',
            destination: {
                city: '',
                country: '',
                coordinates: [0, 0]
            },
            dates: {
                startDate: '',
                endDate: ''
            },
            travelers: {
                adults: 1,
                children: 0
            },
            preferences: {
                budgetType: 'mid-range',
                currency: 'USD',
                interests: [],
                travelStyle: 'solo',
                pace: 'moderate'
            }
        });
        setErrors({});
        setShowSuggestions(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent
                className="max-w-2xl max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-0 bg-white dark:bg-gray-900 border-2 border-blue-100 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl shadow-2xl"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                <DialogTitle className="sr-only">Plan Your Dream Trip</DialogTitle>
                <DialogDescription className="sr-only">Fill in the details below to generate a personalized AI travel itinerary.</DialogDescription>

                {/* Gradient Header */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 px-6 py-6 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2.5 rounded-xl">
                            <Plane className="text-white" size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Create Trip</h2>
                            <p className="text-blue-100 text-sm mt-0.5">Essential details only — fast and clean</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                            Trip Title
                        </Label>
                        <Input
                            id="title"
                            placeholder="e.g., Winter Break in London"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            className={`h-11 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 placeholder-gray-400 rounded-xl focus:border-blue-500 ${errors.title ? 'border-red-500' : ''}`}
                        />
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                    </div>

                    {/* Destination */}
                    <div className="space-y-2">
                        <Label htmlFor="destination" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                            <MapPin size={13} className="text-blue-500" /> Destination
                        </Label>
                        <div className="relative">
                            <Input
                                id="destination"
                                placeholder="City, Country"
                                value={formData.destinationQuery}
                                onFocus={() => setShowSuggestions(true)}
                                onChange={(e) => handleDestinationInput(e.target.value)}
                                className={`h-11 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 placeholder-gray-400 rounded-xl focus:border-blue-500 ${errors.destinationQuery ? 'border-red-500' : ''}`}
                            />

                            {showSuggestions && destinationSuggestions.length > 0 && (
                                <div className="absolute z-30 mt-2 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg max-h-48 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                    {destinationSuggestions.map((item) => (
                                        <button
                                            key={`${item.city}-${item.country}`}
                                            type="button"
                                            onClick={() => applyDestinationSuggestion(item)}
                                            className="w-full text-left px-3 py-2.5 hover:bg-blue-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-200"
                                        >
                                            {item.city}, {item.country}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {errors.destinationQuery && <p className="text-red-500 text-xs mt-1">{errors.destinationQuery}</p>}
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="startDate" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                                <Calendar size={13} className="text-blue-500" /> Start Date
                            </Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={formData.dates.startDate}
                                onChange={(e) => handleNestedInputChange('dates', 'startDate', e.target.value)}
                                className={`h-11 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-xl ${errors['dates.startDate'] ? 'border-red-500' : ''}`}
                            />
                            {errors['dates.startDate'] && <p className="text-red-500 text-xs mt-1">{errors['dates.startDate']}</p>}
                        </div>
                        <div>
                            <Label htmlFor="endDate" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                                <Calendar size={13} className="text-blue-500" /> End Date
                            </Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={formData.dates.endDate}
                                onChange={(e) => handleNestedInputChange('dates', 'endDate', e.target.value)}
                                className={`h-11 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-xl ${errors['dates.endDate'] ? 'border-red-500' : ''}`}
                            />
                            {errors['dates.endDate'] && <p className="text-red-500 text-xs mt-1">{errors['dates.endDate']}</p>}
                        </div>
                    </div>

                    {/* Travelers */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-2">
                            <Users size={13} /> Travelers
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Adults</p>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleNestedInputChange('travelers', 'adults', Math.max(1, formData.travelers.adults - 1))}
                                        className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="text-lg font-bold w-6 text-center text-gray-900 dark:text-white">{formData.travelers.adults}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleNestedInputChange('travelers', 'adults', formData.travelers.adults + 1)}
                                        className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                                {errors['travelers.adults'] && <p className="text-red-500 text-xs mt-1">{errors['travelers.adults']}</p>}
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Children</p>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleNestedInputChange('travelers', 'children', Math.max(0, formData.travelers.children - 1))}
                                        className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="text-lg font-bold w-6 text-center text-gray-900 dark:text-white">{formData.travelers.children}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleNestedInputChange('travelers', 'children', formData.travelers.children + 1)}
                                        className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Budget */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-2">
                            <DollarSign size={13} /> Budget
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            {budgetOptions.map((opt) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => handleNestedInputChange('preferences', 'budgetType', opt.id)}
                                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                                        formData.preferences.budgetType === opt.id
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-blue-300'
                                    }`}
                                >
                                    <div className="text-2xl mb-1">{opt.emoji}</div>
                                    <div className={`text-sm font-semibold ${formData.preferences.budgetType === opt.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>{opt.label}</div>
                                    <div className="text-xs text-gray-400 dark:text-gray-500">{opt.sub}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Currency */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            <DollarSign size={13} className="text-blue-500" /> Currency
                        </Label>
                        <div className="relative">
                            <select
                                value={formData.preferences.currency}
                                onChange={(e) => handleNestedInputChange('preferences', 'currency', e.target.value)}
                                className="w-full h-11 px-3 pr-9 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {[
                                    ['USD','US Dollar','$'],['EUR','Euro','€'],['GBP','British Pound','£'],
                                    ['JPY','Japanese Yen','¥'],['CAD','Canadian Dollar','C$'],['AUD','Australian Dollar','A$'],
                                    ['CHF','Swiss Franc','CHF'],['CNY','Chinese Yuan','¥'],['INR','Indian Rupee','₹'],
                                    ['KRW','South Korean Won','₩'],['SGD','Singapore Dollar','S$'],['HKD','Hong Kong Dollar','HK$'],
                                    ['THB','Thai Baht','฿'],['MXN','Mexican Peso','MX$'],['BRL','Brazilian Real','R$'],
                                    ['AED','UAE Dirham','د.إ'],['SAR','Saudi Riyal','﷼'],
                                ].map(([code, name, symbol]) => (
                                    <option key={code} value={code}>
                                        {code} — {name} ({symbol})
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Travel Style */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-2">
                            <Globe size={13} /> Travel Style
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {travelStyleOptions.map((opt) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => handleNestedInputChange('preferences', 'travelStyle', opt.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                                        formData.preferences.travelStyle === opt.id
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-blue-300'
                                    }`}
                                >
                                    <span>{opt.emoji}</span> {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pace */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-2">
                            <Zap size={13} /> Trip Pace
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            {paceOptions.map((opt) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => handleNestedInputChange('preferences', 'pace', opt.id)}
                                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                                        formData.preferences.pace === opt.id
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-blue-300'
                                    }`}
                                >
                                    <div className="text-2xl mb-1">{opt.emoji}</div>
                                    <div className={`text-sm font-semibold ${formData.preferences.pace === opt.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>{opt.label}</div>
                                    <div className="text-xs text-gray-400 dark:text-gray-500">{opt.sub}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Interests */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-2">
                            <Heart size={13} /> Interests
                            <span className="ml-auto text-xs font-normal normal-case text-gray-400">
                                {formData.preferences.interests.length > 0 ? `${formData.preferences.interests.length} selected` : 'Optional'}
                            </span>
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {interests.map(({ id, label, emoji }) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => handleInterestToggle(id)}
                                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                                        formData.preferences.interests.includes(id)
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-blue-300'
                                    }`}
                                >
                                    <span>{emoji}</span> {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3 pt-2 pb-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="flex-1 h-11 rounded-xl border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold flex items-center justify-center gap-2"
                        >
                            <Plane size={16} />
                            Create Trip
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateTripDialog;
