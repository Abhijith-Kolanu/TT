import React, { useState } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MapPin, Calendar, Users, DollarSign, Heart, Globe, Plus, Minus, Plane, Zap, Feather } from 'lucide-react';

const CreateTripDialog = ({ open, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: '',
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

    const interests = [
        { id: 'culture',     label: 'Culture',     emoji: '🏛️' },
        { id: 'history',     label: 'History',     emoji: '📜' },
        { id: 'food',        label: 'Food',        emoji: '🍜' },
        { id: 'adventure',   label: 'Adventure',   emoji: '🧗' },
        { id: 'relaxation',  label: 'Relaxation',  emoji: '🧘' },
        { id: 'shopping',    label: 'Shopping',    emoji: '🛍️' },
        { id: 'nightlife',   label: 'Nightlife',   emoji: '🎉' },
        { id: 'nature',      label: 'Nature',      emoji: '🌿' },
        { id: 'art',         label: 'Art',         emoji: '🎨' },
        { id: 'museums',     label: 'Museums',     emoji: '🗿' },
    ];

    const budgetOptions = [
        { id: 'budget',    label: 'Budget',    sub: 'Economical',  emoji: '💰' },
        { id: 'mid-range', label: 'Mid-Range', sub: 'Balanced',    emoji: '💳' },
        { id: 'luxury',    label: 'Luxury',    sub: 'Premium',     emoji: '💎' },
    ];

    const travelStyleOptions = [
        { id: 'solo',     label: 'Solo',     emoji: '🧍' },
        { id: 'couple',   label: 'Couple',   emoji: '💑' },
        { id: 'family',   label: 'Family',   emoji: '👨‍👩‍👧' },
        { id: 'friends',  label: 'Friends',  emoji: '👯' },
        { id: 'business', label: 'Business', emoji: '💼' },
    ];

    const paceOptions = [
        { id: 'relaxed',  label: 'Relaxed',  sub: 'Plenty of downtime',    emoji: '🌅' },
        { id: 'moderate', label: 'Moderate', sub: 'Balanced schedule',     emoji: '⚖️' },
        { id: 'packed',   label: 'Packed',   sub: 'See everything',        emoji: '⚡' },
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error for this field
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
        // Clear error for this field
        const errorKey = `${parent}.${field}`;
        if (errors[errorKey]) {
            setErrors(prev => ({
                ...prev,
                [errorKey]: null
            }));
        }
    };

    const handleInterestToggle = (interest) => {
        setFormData(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                interests: prev.preferences.interests.includes(interest)
                    ? prev.preferences.interests.filter(i => i !== interest)
                    : [...prev.preferences.interests, interest]
            }
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Trip title is required';
        }

        if (!formData.destination.city.trim()) {
            newErrors['destination.city'] = 'Destination city is required';
        }

        if (!formData.destination.country.trim()) {
            newErrors['destination.country'] = 'Country is required';
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

        if (formData.preferences.interests.length === 0) {
            newErrors['preferences.interests'] = 'Please select at least one interest';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        // Add approximate coordinates for popular cities (in production, use a geocoding service)
        const cityCoordinates = {
            'Paris': [2.3522, 48.8566],
            'Tokyo': [139.6917, 35.6895],
            'New York': [-74.0060, 40.7128],
            'London': [-0.1276, 51.5074],
            'Rome': [12.4964, 41.9028],
            'Barcelona': [2.1734, 41.3851],
            'Amsterdam': [4.9041, 52.3676],
            'Bangkok': [100.5018, 13.7563],
            'Sydney': [151.2093, -33.8688],
            'Dubai': [55.2708, 25.2048]
        };

        const coordinates = cityCoordinates[formData.destination.city] || [0, 0];
        
        const tripData = {
            ...formData,
            destination: {
                ...formData.destination,
                coordinates
            }
        };

        onSubmit(tripData);
    };

    const resetForm = () => {
        setFormData({
            title: '',
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
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl">
                
                {/* Gradient Header */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 px-6 py-6 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2.5 rounded-xl">
                            <Plane className="text-white" size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Plan Your Dream Trip</h2>
                            <p className="text-blue-100 text-sm mt-0.5">Tell us about your trip and we'll craft the perfect itinerary</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">

                    {/* ── Section: Basic Info ─────────────────────────── */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Trip Details</h3>

                        {/* Trip Title */}
                        <div>
                            <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Trip Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g., Summer Vacation in Paris"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                className={`h-11 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:border-blue-500 focus:ring-blue-500 ${errors.title ? 'border-red-500' : ''}`}
                            />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                        </div>

                        {/* Destination */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="city" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                                    <MapPin size={13} className="text-blue-500" /> City
                                </Label>
                                <Input
                                    id="city"
                                    placeholder="e.g., Paris"
                                    value={formData.destination.city}
                                    onChange={(e) => handleNestedInputChange('destination', 'city', e.target.value)}
                                    className={`h-11 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 placeholder-gray-400 rounded-xl ${errors['destination.city'] ? 'border-red-500' : ''}`}
                                />
                                {errors['destination.city'] && <p className="text-red-500 text-xs mt-1">{errors['destination.city']}</p>}
                            </div>
                            <div>
                                <Label htmlFor="country" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                                    <Globe size={13} className="text-blue-500" /> Country
                                </Label>
                                <Input
                                    id="country"
                                    placeholder="e.g., France"
                                    value={formData.destination.country}
                                    onChange={(e) => handleNestedInputChange('destination', 'country', e.target.value)}
                                    className={`h-11 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 placeholder-gray-400 rounded-xl ${errors['destination.country'] ? 'border-red-500' : ''}`}
                                />
                                {errors['destination.country'] && <p className="text-red-500 text-xs mt-1">{errors['destination.country']}</p>}
                            </div>
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
                                    className={`h-11 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 rounded-xl ${errors['dates.startDate'] ? 'border-red-500' : ''}`}
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
                                    className={`h-11 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 rounded-xl ${errors['dates.endDate'] ? 'border-red-500' : ''}`}
                                />
                                {errors['dates.endDate'] && <p className="text-red-500 text-xs mt-1">{errors['dates.endDate']}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-800" />

                    {/* ── Section: Travelers ───────────────────────────── */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-2">
                            <Users size={13} /> Travelers
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {/* Adults */}
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
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
                            {/* Children */}
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
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

                    <div className="border-t border-gray-100 dark:border-gray-800" />

                    {/* ── Section: Budget ──────────────────────────────── */}
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

                    {/* ── Section: Currency ────────────────────────────── */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            <DollarSign size={13} className="text-blue-500" /> Currency
                        </Label>
                        <Select
                            value={formData.preferences.currency}
                            onValueChange={(value) => handleNestedInputChange('preferences', 'currency', value)}
                        >
                            <SelectTrigger className="h-11 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto rounded-xl">
                                {[
                                    ['USD','US Dollar','$'],['EUR','Euro','€'],['GBP','British Pound','£'],
                                    ['JPY','Japanese Yen','¥'],['CAD','Canadian Dollar','C$'],['AUD','Australian Dollar','A$'],
                                    ['CHF','Swiss Franc','CHF'],['CNY','Chinese Yuan','¥'],['INR','Indian Rupee','₹'],
                                    ['KRW','South Korean Won','₩'],['SGD','Singapore Dollar','S$'],['HKD','Hong Kong Dollar','HK$'],
                                    ['THB','Thai Baht','฿'],['MXN','Mexican Peso','MX$'],['BRL','Brazilian Real','R$'],
                                    ['AED','UAE Dirham','د.إ'],['SAR','Saudi Riyal','﷼'],
                                ].map(([code, name, symbol]) => (
                                    <SelectItem key={code} value={code} className="text-gray-900 dark:text-white">
                                        {code} — {name} ({symbol})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-800" />

                    {/* ── Section: Travel Style ────────────────────────── */}
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

                    {/* ── Section: Pace ────────────────────────────────── */}
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

                    <div className="border-t border-gray-100 dark:border-gray-800" />

                    {/* ── Section: Interests ───────────────────────────── */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-2">
                            <Heart size={13} /> Your Interests
                            <span className="ml-auto text-xs font-normal normal-case text-gray-400">
                                {formData.preferences.interests.length > 0 && `${formData.preferences.interests.length} selected`}
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
                        {errors['preferences.interests'] && (
                            <p className="text-red-500 text-xs mt-1">{errors['preferences.interests']}</p>
                        )}
                    </div>

                    {/* ── Submit Buttons ───────────────────────────────── */}
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
                            Generate Itinerary
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateTripDialog;
