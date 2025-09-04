import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MapPin, Calendar, Users, DollarSign, Heart, Globe } from 'lucide-react';

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
        'culture', 'history', 'food', 'adventure', 'relaxation', 
        'shopping', 'nightlife', 'nature', 'art', 'museums'
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl text-gray-900 dark:text-white">
                        <MapPin className="text-blue-600" />
                        Plan Your Dream Trip
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Trip Title */}
                    <div>
                        <Label htmlFor="title" className="text-gray-900 dark:text-white">Trip Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g., Summer Vacation in Paris"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            className={`bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 ${errors.title ? 'border-red-500' : ''}`}
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>

                    {/* Destination */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="city" className="text-gray-900 dark:text-white">Destination City</Label>
                            <Input
                                id="city"
                                placeholder="e.g., Paris"
                                value={formData.destination.city}
                                onChange={(e) => handleNestedInputChange('destination', 'city', e.target.value)}
                                className={`bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 ${errors['destination.city'] ? 'border-red-500' : ''}`}
                            />
                            {errors['destination.city'] && (
                                <p className="text-red-500 text-sm mt-1">{errors['destination.city']}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="country" className="text-gray-900 dark:text-white">Country</Label>
                            <Input
                                id="country"
                                placeholder="e.g., France"
                                value={formData.destination.country}
                                onChange={(e) => handleNestedInputChange('destination', 'country', e.target.value)}
                                className={`bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 ${errors['destination.country'] ? 'border-red-500' : ''}`}
                            />
                            {errors['destination.country'] && (
                                <p className="text-red-500 text-sm mt-1">{errors['destination.country']}</p>
                            )}
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="startDate" className="flex items-center gap-2 text-gray-900 dark:text-white">
                                <Calendar size={16} />
                                Start Date
                            </Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={formData.dates.startDate}
                                onChange={(e) => handleNestedInputChange('dates', 'startDate', e.target.value)}
                                className={`bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 ${errors['dates.startDate'] ? 'border-red-500' : ''}`}
                            />
                            {errors['dates.startDate'] && (
                                <p className="text-red-500 text-sm mt-1">{errors['dates.startDate']}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="endDate" className="flex items-center gap-2 text-gray-900 dark:text-white">
                                <Calendar size={16} />
                                End Date
                            </Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={formData.dates.endDate}
                                onChange={(e) => handleNestedInputChange('dates', 'endDate', e.target.value)}
                                className={`bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 ${errors['dates.endDate'] ? 'border-red-500' : ''}`}
                            />
                            {errors['dates.endDate'] && (
                                <p className="text-red-500 text-sm mt-1">{errors['dates.endDate']}</p>
                            )}
                        </div>
                    </div>

                    {/* Travelers */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="adults" className="flex items-center gap-2 text-gray-900 dark:text-white">
                                <Users size={16} />
                                Adults
                            </Label>
                            <Input
                                id="adults"
                                type="number"
                                min="1"
                                value={formData.travelers.adults}
                                onChange={(e) => handleNestedInputChange('travelers', 'adults', parseInt(e.target.value))}
                                className={`bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 ${errors['travelers.adults'] ? 'border-red-500' : ''}`}
                            />
                            {errors['travelers.adults'] && (
                                <p className="text-red-500 text-sm mt-1">{errors['travelers.adults']}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="children" className="text-gray-900 dark:text-white">Children</Label>
                            <Input
                                id="children"
                                type="number"
                                min="0"
                                value={formData.travelers.children}
                                onChange={(e) => handleNestedInputChange('travelers', 'children', parseInt(e.target.value))}
                                className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                            />
                        </div>
                    </div>

                    {/* Budget Type */}
                    <div>
                        <Label className="flex items-center gap-2 text-gray-900 dark:text-white">
                            <DollarSign size={16} />
                            Budget Type
                        </Label>
                        <Select
                            value={formData.preferences.budgetType}
                            onValueChange={(value) => handleNestedInputChange('preferences', 'budgetType', value)}
                        >
                            <SelectTrigger className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                                <SelectItem value="budget" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">Budget (Economical options)</SelectItem>
                                <SelectItem value="mid-range" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">Mid-Range (Balanced experience)</SelectItem>
                                <SelectItem value="luxury" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">Luxury (Premium experiences)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Currency */}
                    <div>
                        <Label className="flex items-center gap-2 text-gray-900 dark:text-white">
                            <DollarSign size={16} />
                            Currency
                        </Label>
                        <Select
                            value={formData.preferences.currency}
                            onValueChange={(value) => handleNestedInputChange('preferences', 'currency', value)}
                        >
                            <SelectTrigger className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 max-h-60 overflow-y-auto">
                                <SelectItem value="USD" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">USD - US Dollar ($)</SelectItem>
                                <SelectItem value="EUR" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">EUR - Euro (€)</SelectItem>
                                <SelectItem value="GBP" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">GBP - British Pound (£)</SelectItem>
                                <SelectItem value="JPY" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">JPY - Japanese Yen (¥)</SelectItem>
                                <SelectItem value="CAD" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">CAD - Canadian Dollar (C$)</SelectItem>
                                <SelectItem value="AUD" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">AUD - Australian Dollar (A$)</SelectItem>
                                <SelectItem value="CHF" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">CHF - Swiss Franc (CHF)</SelectItem>
                                <SelectItem value="CNY" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">CNY - Chinese Yuan (¥)</SelectItem>
                                <SelectItem value="INR" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">INR - Indian Rupee (₹)</SelectItem>
                                <SelectItem value="KRW" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">KRW - South Korean Won (₩)</SelectItem>
                                <SelectItem value="SGD" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">SGD - Singapore Dollar (S$)</SelectItem>
                                <SelectItem value="HKD" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">HKD - Hong Kong Dollar (HK$)</SelectItem>
                                <SelectItem value="THB" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">THB - Thai Baht (฿)</SelectItem>
                                <SelectItem value="MXN" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">MXN - Mexican Peso (MX$)</SelectItem>
                                <SelectItem value="BRL" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">BRL - Brazilian Real (R$)</SelectItem>
                                <SelectItem value="RUB" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">RUB - Russian Ruble (₽)</SelectItem>
                                <SelectItem value="ZAR" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">ZAR - South African Rand (R)</SelectItem>
                                <SelectItem value="TRY" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">TRY - Turkish Lira (₺)</SelectItem>
                                <SelectItem value="AED" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">AED - UAE Dirham (د.إ)</SelectItem>
                                <SelectItem value="SAR" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">SAR - Saudi Riyal (﷼)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Travel Style */}
                    <div>
                        <Label className="flex items-center gap-2 text-gray-900 dark:text-white">
                            <Globe size={16} />
                            Travel Style
                        </Label>
                        <Select
                            value={formData.preferences.travelStyle}
                            onValueChange={(value) => handleNestedInputChange('preferences', 'travelStyle', value)}
                        >
                            <SelectTrigger className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                                <SelectItem value="solo" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">Solo Adventure</SelectItem>
                                <SelectItem value="couple" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">Romantic Getaway</SelectItem>
                                <SelectItem value="family" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">Family Trip</SelectItem>
                                <SelectItem value="friends" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">Friends Trip</SelectItem>
                                <SelectItem value="business" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">Business Travel</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Pace */}
                    <div>
                        <Label className="text-gray-900 dark:text-white">Trip Pace</Label>
                        <Select
                            value={formData.preferences.pace}
                            onValueChange={(value) => handleNestedInputChange('preferences', 'pace', value)}
                        >
                            <SelectTrigger className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                                <SelectItem value="relaxed" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">Relaxed (Plenty of downtime)</SelectItem>
                                <SelectItem value="moderate" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">Moderate (Balanced schedule)</SelectItem>
                                <SelectItem value="packed" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">Packed (See everything)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Interests */}
                    <div>
                        <Label className="flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
                            <Heart size={16} />
                            Your Interests
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                            {interests.map((interest) => (
                                <button
                                    key={interest}
                                    type="button"
                                    onClick={() => handleInterestToggle(interest)}
                                    className={`p-2 rounded-lg border text-sm capitalize transition-colors ${
                                        formData.preferences.interests.includes(interest)
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                                    }`}
                                >
                                    {interest}
                                </button>
                            ))}
                        </div>
                        {errors['preferences.interests'] && (
                            <p className="text-red-500 text-sm mt-1">{errors['preferences.interests']}</p>
                        )}
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            Create Trip
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateTripDialog;
