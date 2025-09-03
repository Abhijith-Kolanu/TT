import mongoose from "mongoose";

const dayItinerarySchema = new mongoose.Schema({
    day: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    activities: [{
        time: String, // e.g., "09:00 AM"
        title: String,
        description: String,
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: [Number], // [longitude, latitude]
            name: String,
            address: String
        },
        estimatedDuration: Number, // in minutes
        category: {
            type: String,
            enum: ['sightseeing', 'food', 'shopping', 'adventure', 'relaxation', 'transport', 'accommodation', 'nightlife'],
            default: 'sightseeing'
        },
        estimatedCost: {
            budget: Number,
            midRange: Number,
            luxury: Number
        }
    }]
});

const tripSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    destination: {
        city: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    dates: {
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        duration: {
            type: Number, // in days
            required: true
        }
    },
    travelers: {
        adults: {
            type: Number,
            default: 1
        },
        children: {
            type: Number,
            default: 0
        }
    },
    preferences: {
        budgetType: {
            type: String,
            enum: ['budget', 'mid-range', 'luxury'],
            default: 'mid-range'
        },
        interests: [{
            type: String,
            enum: ['culture', 'history', 'food', 'adventure', 'relaxation', 'shopping', 'nightlife', 'nature', 'art', 'museums']
        }],
        travelStyle: {
            type: String,
            enum: ['solo', 'couple', 'family', 'friends', 'business'],
            default: 'solo'
        },
        pace: {
            type: String,
            enum: ['relaxed', 'moderate', 'packed'],
            default: 'moderate'
        }
    },
    itinerary: [dayItinerarySchema],
    totalEstimatedCost: {
        budget: {
            accommodation: Number,
            food: Number,
            activities: Number,
            transport: Number,
            total: Number
        },
        midRange: {
            accommodation: Number,
            food: Number,
            activities: Number,
            transport: Number,
            total: Number
        },
        luxury: {
            accommodation: Number,
            food: Number,
            activities: Number,
            transport: Number,
            total: Number
        }
    },
    status: {
        type: String,
        enum: ['draft', 'generated', 'published', 'completed'],
        default: 'draft'
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    generatedBy: {
        type: String,
        enum: ['ai', 'manual'],
        default: 'ai'
    }
}, { timestamps: true });

// Index for geospatial queries
tripSchema.index({ "destination.coordinates": "2dsphere" });
tripSchema.index({ "itinerary.activities.location.coordinates": "2dsphere" });

export const Trip = mongoose.model('Trip', tripSchema);
