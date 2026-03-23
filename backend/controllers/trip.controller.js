import { GoogleGenerativeAI } from '@google/generative-ai';
import PDFDocument from 'pdfkit';
import { Trip } from '../models/trip.model.js';
import User from '../models/user.model.js';

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY;
console.log('Gemini API Key available:', apiKey ? 'Yes' : 'No');

if (!apiKey) {
    console.error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_MODELS = [
    GEMINI_MODEL,
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
].filter((modelName, index, arr) => modelName && arr.indexOf(modelName) === index);

const generateAIContent = async (prompt) => {
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is missing');
    }

    let lastError;

    for (const modelName of GEMINI_MODELS) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response?.text?.() || '';
        } catch (error) {
            lastError = error;
            const statusCode = error?.status || error?.httpStatus;
            const message = (error?.message || '').toLowerCase();
            const isModelAvailabilityIssue = statusCode === 404 || message.includes('not found') || message.includes('not supported') || message.includes('model');

            if (!isModelAvailabilityIssue) {
                throw error;
            }

            console.warn(`Gemini model ${modelName} unavailable, trying next model...`);
        }
    }

    throw lastError || new Error('No available Gemini model found for this API key/project');
};

const ALLOWED_ACTIVITY_CATEGORIES = ['sightseeing', 'food', 'shopping', 'adventure', 'relaxation', 'transport', 'accommodation', 'nightlife'];

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const normalizeTime = (timeValue, slotValue) => {
    const timeText = String(timeValue || '').trim();
    const slot = String(slotValue || '').toLowerCase();
    const match = timeText.match(/(\d{1,2}):(\d{2})/);

    if (match) {
        const hour = clamp(toNumber(match[1], 9), 0, 23);
        const minute = clamp(toNumber(match[2], 0), 0, 59);
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }

    if (slot.includes('morning')) return '09:00';
    if (slot.includes('afternoon')) return '14:00';
    if (slot.includes('evening')) return '18:30';
    return '10:00';
};

const parseAIJson = (text) => {
    if (!text || typeof text !== 'string') {
        throw new Error('Empty AI response');
    }

    let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    cleaned = cleaned.replace(/,\s*([}\]])/g, '$1').trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('No valid JSON object found in AI response');
    }

    return JSON.parse(jsonMatch[0]);
};

const buildDateForDay = (startDate, dayIndex) => {
    const base = new Date(startDate);
    base.setHours(0, 0, 0, 0);
    base.setDate(base.getDate() + dayIndex);
    return base;
};

const sanitizeActivityTitle = (value) => String(value || '')
    .replace(/^activity\s*\d*\s*[:.\-–]\s*/i, '')
    .replace(/^activity\s+/i, '')
    .trim();

const isGenericActivityTitle = (value) => {
    const text = String(value || '').trim().toLowerCase();
    if (!text) return true;
    return /^activity(\s*\d+)?\s*$/.test(text) || /^activity\s*\d+\s*[:.\-–]?\s*$/.test(text);
};

const normalizeComparableText = (value) => String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const buildTitleFromDescription = (description, category) => {
    const base = String(description || '')
        .replace(/^activity\s*\d*\s*[:.\-–]?\s*/i, '')
        .trim();
    if (!base) return '';

    const routeMatch = base.match(/from\s+(.+?)\s+to\s+(.+?)(?:[,.]|$)/i);
    if (routeMatch) {
        const from = routeMatch[1].trim();
        const to = routeMatch[2].trim();
        const prefix = category === 'transport' ? 'Transfer' : 'Route';
        return `${prefix}: ${from} to ${to}`.slice(0, 90);
    }

    const firstClause = base.split(/,|;|\.|\s+then\s+/i)[0].trim();
    if (firstClause.length >= 6) {
        return firstClause.slice(0, 90);
    }

    return '';
};

const buildActivityTitle = ({ rawTitle, description, category, locationText, activityIndex }) => {
    const cleanedTitle = sanitizeActivityTitle(rawTitle);
    if (!isGenericActivityTitle(cleanedTitle)) {
        return cleanedTitle.slice(0, 90);
    }

    const location = String(locationText || '').trim();
    if (location && !/city center/i.test(location)) {
        const prefix = category === 'food' ? 'Meal at' : 'Visit';
        return `${prefix} ${location}`.slice(0, 90);
    }

    const titleFromDescription = buildTitleFromDescription(description, category);
    if (titleFromDescription) {
        const comparableTitle = normalizeComparableText(titleFromDescription);
        const comparableDescription = normalizeComparableText(description);
        if (comparableTitle && comparableTitle !== comparableDescription) {
            return titleFromDescription;
        }

        const words = titleFromDescription.split(/\s+/).filter(Boolean).slice(0, 6).join(' ');
        if (words.length >= 6) {
            return words.slice(0, 90);
        }
    }

    return `Plan ${activityIndex + 1}`;
};

const normalizeItinerary = (aiItinerary, trip) => {
    const rawDays = Array.isArray(aiItinerary) ? aiItinerary : [];
    const destinationCoords = Array.isArray(trip.destination?.coordinates) && trip.destination.coordinates.length === 2
        ? trip.destination.coordinates
        : [0, 0];
    const maxActivitiesPerDay = trip.preferences?.pace === 'packed' ? 5 : trip.preferences?.pace === 'relaxed' ? 3 : 4;

    return rawDays.slice(0, trip.dates.duration).map((dayItem, dayIndex) => {
        const rawActivities = Array.isArray(dayItem?.activities) ? dayItem.activities : [];

        const activities = rawActivities.slice(0, maxActivitiesPerDay).map((activity, activityIndex) => {
            const activityObject = (activity && typeof activity === 'object') ? activity : {};
            const activityText = typeof activity === 'string' ? activity : '';

            const categoryCandidate = String(activityObject?.category || '').toLowerCase();
            const category = ALLOWED_ACTIVITY_CATEGORIES.includes(categoryCandidate) ? categoryCandidate : 'sightseeing';
            const duration = clamp(toNumber(activityObject?.estimatedDuration ?? activityObject?.duration, 90), 30, 300);

            const locationText = typeof activityObject?.location === 'string'
                ? activityObject.location
                : (activityObject?.location?.name || activityObject?.address || `${trip.destination.city} city center`);

            const coordinates = Array.isArray(activityObject?.location?.coordinates) && activityObject.location.coordinates.length === 2
                ? activityObject.location.coordinates
                : destinationCoords;

            const description = String(activityObject?.description || activityObject?.tips || activityText || '').trim();
            const title = buildActivityTitle({
                rawTitle: activityObject?.title || activityObject?.activity || activityObject?.name || activityText,
                description,
                category,
                locationText,
                activityIndex
            });

            const budgetCost = clamp(toNumber(activityObject?.estimatedCost?.budget, toNumber(activityObject?.cost, 20)), 0, 99999);
            const midRangeCost = clamp(toNumber(activityObject?.estimatedCost?.midRange, Math.round(budgetCost * 1.7)), 0, 99999);
            const luxuryCost = clamp(toNumber(activityObject?.estimatedCost?.luxury, Math.round(midRangeCost * 1.9)), 0, 99999);

            return {
                time: normalizeTime(activityObject?.time, activityObject?.slot),
                title,
                description: description.slice(0, 240),
                location: {
                    type: 'Point',
                    coordinates,
                    name: String(locationText).trim().slice(0, 140),
                    address: String(activityObject?.address || locationText || '').trim().slice(0, 220)
                },
                estimatedDuration: duration,
                category,
                estimatedCost: {
                    budget: budgetCost,
                    midRange: midRangeCost,
                    luxury: luxuryCost
                }
            };
        });

        return {
            day: dayIndex + 1,
            date: dayItem?.date ? new Date(dayItem.date) : buildDateForDay(trip.dates.startDate, dayIndex),
            activities
        };
    }).filter(day => Array.isArray(day.activities) && day.activities.length > 0);
};

const normalizeTotalEstimatedCost = (totalEstimatedCost, itinerary) => {
    const days = Math.max(itinerary.length, 1);

    const sumActivities = itinerary.reduce((sum, day) => {
        const daySum = (day.activities || []).reduce((activityTotal, activity) => {
            return activityTotal + toNumber(activity?.estimatedCost?.budget, 0);
        }, 0);
        return sum + daySum;
    }, 0);

    const normalizeTier = (tier, defaults) => {
        const accommodation = toNumber(tier?.accommodation, defaults.accommodation);
        const food = toNumber(tier?.food, defaults.food);
        const activities = toNumber(tier?.activities, defaults.activities);
        const transport = toNumber(tier?.transport, defaults.transport);
        const total = toNumber(tier?.total, accommodation + food + activities + transport);
        return { accommodation, food, activities, transport, total };
    };

    return {
        budget: normalizeTier(totalEstimatedCost?.budget, {
            accommodation: days * 50,
            food: days * 30,
            activities: sumActivities,
            transport: days * 20
        }),
        midRange: normalizeTier(totalEstimatedCost?.midRange, {
            accommodation: days * 130,
            food: days * 60,
            activities: Math.round(sumActivities * 1.8),
            transport: days * 40
        }),
        luxury: normalizeTier(totalEstimatedCost?.luxury, {
            accommodation: days * 280,
            food: days * 120,
            activities: Math.round(sumActivities * 3.2),
            transport: days * 90
        })
    };
};

const normalizePriceRange = (value) => {
    const text = String(value || '').toLowerCase().replace(/\s|-/g, '');
    if (text === 'budget') return 'budget';
    if (text === 'midrange' || text === 'mid') return 'midRange';
    if (text === 'luxury') return 'luxury';
    return 'midRange';
};

const normalizeRecommendationItems = (items) => {
    const safeItems = Array.isArray(items) ? items : [];
    return safeItems.slice(0, 6).map((item, index) => ({
        name: String(item?.name || `Recommendation ${index + 1}`).trim().slice(0, 80),
        description: String(item?.description || '').trim().slice(0, 220),
        location: String(item?.location || '').trim().slice(0, 160),
        rating: clamp(toNumber(item?.rating, 4.2), 1, 5),
        priceRange: normalizePriceRange(item?.priceRange),
        tags: Array.isArray(item?.tags) ? item.tags.slice(0, 4).map(tag => String(tag).slice(0, 24)) : [],
        openingHours: item?.openingHours ? String(item.openingHours).slice(0, 90) : undefined,
        insider_tip: item?.insider_tip ? String(item.insider_tip).slice(0, 180) : undefined,
        specialties: Array.isArray(item?.specialties) ? item.specialties.slice(0, 4).map(s => String(s).slice(0, 30)) : undefined,
        duration: item?.duration ? String(item.duration).slice(0, 40) : undefined,
        schedule: item?.schedule ? String(item.schedule).slice(0, 80) : undefined,
        averageCost: toNumber(item?.averageCost, undefined)
    }));
};

const normalizeRecommendations = (payload) => ({
    restaurants: normalizeRecommendationItems(payload?.restaurants),
    attractions: normalizeRecommendationItems(payload?.attractions),
    events: normalizeRecommendationItems(payload?.events),
    hiddenGems: normalizeRecommendationItems(payload?.hiddenGems),
    shopping: normalizeRecommendationItems(payload?.shopping)
});

// Create a new trip
export const createTrip = async (req, res) => {
    try {
        console.log('Received trip data:', JSON.stringify(req.body, null, 2));
        
        const { 
            title, 
            destination, 
            dates, 
            travelers, 
            preferences
        } = req.body;

        const userId = req.user._id;
        console.log('User ID:', userId);

        // Calculate duration if not provided
        const startDate = new Date(dates.startDate);
        const endDate = new Date(dates.endDate);
        const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

        const tripData = {
            user: userId, // Changed from userId to user
            title,
            destination,
            dates: {
                ...dates,
                duration
            },
            travelers,
            preferences,
            status: 'draft'
        };

        console.log('Trip data to save:', JSON.stringify(tripData, null, 2));

        const newTrip = new Trip(tripData);
        await newTrip.save();

        res.status(201).json({
            success: true,
            message: 'Trip created successfully',
            trip: newTrip
        });
    } catch (error) {
        console.error('Error creating trip:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Generate AI-powered itinerary using Gemini
export const generateItinerary = async (req, res) => {
    try {
        const { tripId } = req.params;
        const userId = req.user._id;

        const trip = await Trip.findOne({ _id: tripId, user: userId });
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }

                const maxActivitiesPerDay = trip.preferences?.pace === 'packed' ? 5 : trip.preferences?.pace === 'relaxed' ? 3 : 4;
                const interests = Array.isArray(trip.preferences?.interests) && trip.preferences.interests.length > 0
                        ? trip.preferences.interests.join(', ')
                        : 'general sightseeing, local food';

                const prompt = `Create a realistic, practical ${trip.dates.duration}-day travel itinerary for ${trip.destination.city}, ${trip.destination.country}.

Traveler context:
- Budget: ${trip.preferences?.budgetType || 'mid-range'}
- Pace: ${trip.preferences?.pace || 'moderate'}
- Interests: ${interests}
- Group: ${trip.travelers?.adults || 1} adults, ${trip.travelers?.children || 0} children

Rules:
1) Keep it concise and practical for real travelers.
2) Each day must include ONLY ${maxActivitiesPerDay - 1} to ${maxActivitiesPerDay} activities.
3) Organize activities logically across morning, afternoon, evening.
4) Use real, well-known places that actually exist.
5) Avoid fictional places, avoid generic AI wording, avoid long paragraphs.
6) Include realistic transit flow between stops.
7) Use only one category per activity from: sightseeing, food, shopping, adventure, relaxation, transport, accommodation, nightlife.
8) Return valid JSON only (no markdown, no comments).

Return this schema exactly:
{
    "itinerary": [
        {
            "day": 1,
            "date": "YYYY-MM-DD",
            "summary": "One-line plan for the day",
            "activities": [
                {
                    "slot": "morning|afternoon|evening",
                    "time": "HH:MM",
                    "title": "Activity name",
                    "description": "Short useful note",
                    "location": "Place name, area",
                    "address": "Optional short address",
                    "category": "sightseeing",
                    "duration": 90,
                    "estimatedCost": { "budget": 20, "midRange": 35, "luxury": 60 },
                    "tips": "Optional practical tip"
                }
            ]
        }
    ],
    "totalEstimatedCost": {
        "budget": { "accommodation": 0, "food": 0, "activities": 0, "transport": 0, "total": 0 },
        "midRange": { "accommodation": 0, "food": 0, "activities": 0, "transport": 0, "total": 0 },
        "luxury": { "accommodation": 0, "food": 0, "activities": 0, "transport": 0, "total": 0 }
    }
}`;

        console.log('Sending request to AI API...');
        try {
            let text = await generateAIContent(prompt);
            console.log('Received response from AI API');
            console.log('Raw AI response:', text.substring(0, 500) + '...');
            
            let aiResponse;
            try {
                aiResponse = parseAIJson(text);
                console.log('Successfully parsed AI response');
            } catch (parseError) {
                console.error('Error parsing AI response:', parseError);
                return res.status(422).json({
                    success: false,
                    message: 'AI response format was invalid. Please try again.',
                    error: parseError.message
                });
            }

            const normalizedItinerary = normalizeItinerary(aiResponse?.itinerary, trip);
            if (normalizedItinerary.length === 0) {
                return res.status(422).json({
                    success: false,
                    message: 'AI returned an empty itinerary. Please try again.',
                    error: 'EMPTY_ITINERARY'
                });
            }

            trip.itinerary = normalizedItinerary;
            trip.totalEstimatedCost = normalizeTotalEstimatedCost(aiResponse?.totalEstimatedCost, normalizedItinerary);
            trip.status = 'generated';

            await trip.save();
            console.log('Trip updated successfully with AI itinerary');

            res.status(200).json({
                success: true,
                message: 'Itinerary generated successfully',
                trip: trip
            });
        } catch (aiError) {
            console.error('AI API Error:', aiError);

            // Provide meaningful messages for common AI errors
            const status = aiError.status || aiError.httpStatus;
            if (status === 429) {
                return res.status(429).json({
                    success: false,
                    message: 'AI quota exceeded. Please wait a moment and try again, or check your Gemini API plan.',
                    error: aiError.message
                });
            }
            if (status === 404) {
                return res.status(500).json({
                    success: false,
                    message: 'AI model not available for your API key/project. Try setting GEMINI_MODEL in backend/.env (for example: gemini-2.5-flash).',
                    error: aiError.message
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Failed to generate itinerary with AI',
                error: aiError.message
            });
        }

    } catch (error) {
        console.error('Error generating itinerary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate itinerary'
        });
    }
};

// Get smart recommendations using Gemini
export const getSmartRecommendations = async (req, res) => {
    try {
        const { tripId } = req.params;
        const userId = req.user._id;

        const trip = await Trip.findOne({ _id: tripId, user: userId });
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }

        // Retry logic for API calls
        const retryWithBackoff = async (fn, maxRetries = 3) => {
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    return await fn();
                } catch (error) {
                    if (error.status === 503 && attempt < maxRetries) {
                        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
                        console.log(`API overloaded, retrying in ${delay}ms... (attempt ${attempt}/${maxRetries})`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                    throw error;
                }
            }
        };

                const interests = Array.isArray(trip.preferences?.interests) && trip.preferences.interests.length > 0
                        ? trip.preferences.interests.join(', ')
                        : 'culture, food, sightseeing';

                const prompt = `Create practical local recommendations for ${trip.destination.city}, ${trip.destination.country}.

Context:
- Duration: ${trip.dates.duration} days
- Budget: ${trip.preferences?.budgetType || 'mid-range'}
- Interests: ${interests}

Requirements:
1) Use only real, well-known places.
2) Keep descriptions concise and useful.
3) Avoid generic filler text.
4) Return JSON only.
5) 3-5 items per category.

Return this exact structure:
{
    "restaurants": [{"name":"","description":"","location":"","rating":4.5,"priceRange":"midRange","tags":[""],"openingHours":"","insider_tip":""}],
    "attractions": [{"name":"","description":"","location":"","rating":4.5,"priceRange":"midRange","tags":[""],"duration":""}],
    "events": [{"name":"","description":"","location":"","rating":4.2,"priceRange":"budget","schedule":""}],
    "hiddenGems": [{"name":"","description":"","location":"","rating":4.4,"priceRange":"budget","tags":[""]}],
    "shopping": [{"name":"","description":"","location":"","rating":4.3,"priceRange":"midRange","tags":[""]}]
}`;

        // Make API call with retry logic
        let text = await retryWithBackoff(async () => {
            return await generateAIContent(prompt);
        });

        console.log('Raw AI response length:', text.length);

        let recommendations;
        try {
            const parsed = parseAIJson(text);
            recommendations = normalizeRecommendations(parsed);
            console.log('Successfully parsed recommendations');
        } catch (parseError) {
            console.error('Error parsing recommendations response:', parseError);
            return res.status(422).json({
                success: false,
                message: 'Recommendations format was invalid. Please try again.',
                error: parseError.message
            });
        }

        res.status(200).json({
            success: true,
            recommendations: recommendations
        });

    } catch (error) {
        console.error('Error getting smart recommendations:', error);
        
        // Handle specific error cases
        if (error.message && error.message.includes('Too Many Requests')) {
            return res.status(429).json({
                success: false,
                message: 'API quota exceeded. Please try again later.',
                error: 'QUOTA_EXCEEDED'
            });
        }

        if (error.message && error.message.includes('quota')) {
            return res.status(429).json({
                success: false,
                message: 'API usage limit reached. Please try again in 24 hours.',
                error: 'QUOTA_EXCEEDED'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to get recommendations',
            error: 'INTERNAL_ERROR'
        });
    }
};

// Get user's trips
export const getUserTrips = async (req, res) => {
    try {
        const userId = req.user._id;
        const trips = await Trip.find({ user: userId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            trips: trips
        });
    } catch (error) {
        console.error('Error fetching user trips:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch trips'
        });
    }
};

// Get trip by ID
export const getTripById = async (req, res) => {
    try {
        const { tripId } = req.params;
        const userId = req.user._id;

        const trip = await Trip.findOne({ _id: tripId, user: userId });
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }

        res.status(200).json({
            success: true,
            trip: trip
        });
    } catch (error) {
        console.error('Error fetching trip:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch trip'
        });
    }
};

// Update trip
export const updateTrip = async (req, res) => {
    try {
        const { tripId } = req.params;
        const userId = req.user._id;
        const updates = req.body;

        const trip = await Trip.findOneAndUpdate(
            { _id: tripId, user: userId },
            updates,
            { new: true }
        );

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Trip updated successfully',
            trip: trip
        });
    } catch (error) {
        console.error('Error updating trip:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update trip'
        });
    }
};

// Delete trip
export const deleteTrip = async (req, res) => {
    try {
        const { tripId } = req.params;
        const userId = req.user._id;

        const trip = await Trip.findOneAndDelete({ _id: tripId, user: userId });
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Trip deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting trip:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete trip'
        });
    }
};

// Get real-time travel information (Feature 4)
export const getRealTimeInfo = async (req, res) => {
    try {
        const { tripId } = req.params;
        const userId = req.user._id;

        const trip = await Trip.findOne({ _id: tripId, user: userId });
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }

        const itineraryPlaces = (trip.itinerary || [])
            .flatMap(day => day.activities || [])
            .map(activity => activity?.location?.name || activity?.location?.address)
            .filter(Boolean)
            .slice(0, 8)
            .join(', ');

        const prompt = `
    Get current real-time travel information for ${trip.destination.city}, ${trip.destination.country}.
    Focus on traveler-relevant updates near these planned places: ${itineraryPlaces || `${trip.destination.city} city center`}.

IMPORTANT: Respond with ONLY valid JSON. No markdown code blocks, no comments, no additional text.

Please provide updated information in JSON format:
{
  "weather": {
    "current": {
      "temperature": "current temp",
      "condition": "weather condition",
      "humidity": "humidity %",
      "windSpeed": "wind speed"
    },
    "forecast": [
      {
        "date": "YYYY-MM-DD",
        "high": "high temp",
        "low": "low temp",
        "condition": "weather condition",
        "precipitation": "chance %"
      }
    ]
  },
  "transportation": {
    "publicTransport": {
      "status": "operational/disrupted",
      "updates": ["any service updates"],
      "avgDelays": "average delay time"
    },
    "traffic": {
      "currentCondition": "light/moderate/heavy",
      "majorRoutes": [
        {
          "route": "route name",
          "status": "clear/congested/blocked",
          "estimatedDelay": "delay time"
        }
      ]
    }
  },
  "localEvents": [
    {
      "name": "Event Name",
      "date": "YYYY-MM-DD",
      "type": "festival/concert/sports/cultural",
      "impact": "high/medium/low",
      "description": "brief description"
    }
  ],
    "nearbyEvents": [
        {
            "name": "Event near planned location",
            "date": "YYYY-MM-DD",
            "location": "venue or neighborhood",
            "distanceFromPlannedArea": "e.g. 1.2 km",
            "summary": "why traveler may care"
        }
    ],
    "currentNews": [
        {
            "headline": "news headline",
            "impact": "high/medium/low",
            "summary": "how it affects travelers",
            "affectedArea": "area/route"
        }
    ],
  "safetyAlerts": [
    {
      "type": "weather/security/health/transport",
      "level": "low/medium/high",
      "description": "alert description",
      "recommendations": ["recommendation1", "recommendation2"]
    }
  ],
  "lastUpdated": "current timestamp"
}

Provide realistic and current information. If specific real-time data is not available, provide general seasonal/typical information for the destination and clearly mark it as typical.

Return ONLY the JSON object above. No additional text, explanations, or markdown formatting.`;

        const text = await generateAIContent(prompt);

        let realTimeInfo;
        try {
            realTimeInfo = parseAIJson(text);
        } catch (parseError) {
            console.error('Error parsing real-time info response:', parseError);
            return res.status(500).json({
                success: false,
                message: 'Error processing real-time information'
            });
        }

        const localEvents = Array.isArray(realTimeInfo?.localEvents) ? realTimeInfo.localEvents : [];
        const normalizedNearbyEvents = Array.isArray(realTimeInfo?.nearbyEvents) && realTimeInfo.nearbyEvents.length > 0
            ? realTimeInfo.nearbyEvents
            : localEvents.map(event => ({
                name: String(event?.name || 'Local Event').slice(0, 90),
                date: event?.date ? String(event.date).slice(0, 20) : undefined,
                location: String(event?.location || trip.destination.city).slice(0, 90),
                distanceFromPlannedArea: event?.distanceFromPlannedArea ? String(event.distanceFromPlannedArea).slice(0, 30) : 'Near city center',
                summary: String(event?.description || 'Notable local event near your itinerary').slice(0, 180)
            })).slice(0, 6);

        const normalizedCurrentNews = Array.isArray(realTimeInfo?.currentNews) && realTimeInfo.currentNews.length > 0
            ? realTimeInfo.currentNews
            : localEvents.slice(0, 4).map(event => ({
                headline: `${event?.name || 'Travel update'} in ${trip.destination.city}`,
                impact: String(event?.impact || 'medium').slice(0, 20),
                summary: String(event?.description || 'May affect local crowds, transport, or availability near your planned places.').slice(0, 200),
                affectedArea: String(event?.location || trip.destination.city).slice(0, 80)
            }));

        const normalizedRealTimeInfo = {
            ...realTimeInfo,
            localEvents,
            nearbyEvents: normalizedNearbyEvents,
            currentNews: normalizedCurrentNews,
            lastUpdated: realTimeInfo?.lastUpdated || new Date().toISOString()
        };

        res.status(200).json({
            success: true,
            realTimeInfo: normalizedRealTimeInfo
        });

    } catch (error) {
        console.error('Error getting real-time info:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get real-time information'
        });
    }
};

export const shareTrip = async (req, res) => {
    try {
        const { tripId } = req.params;
        const userId = req.user._id;

        const trip = await Trip.findOne({ _id: tripId, user: userId });
        if (!trip) {
            return res.status(404).json({ success: false, message: 'Trip not found' });
        }

        const frontendBase = process.env.URL || 'http://localhost:5173';
        const shareUrl = `${frontendBase.replace(/\/$/, '')}/trip/${tripId}`;

        return res.status(200).json({
            success: true,
            shareUrl
        });
    } catch (error) {
        console.error('Error sharing trip:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to generate share link'
        });
    }
};

export const exportTrip = async (req, res) => {
    try {
        const { tripId, format } = req.params;
        const userId = req.user._id;

        const trip = await Trip.findOne({ _id: tripId, user: userId });
        if (!trip) {
            return res.status(404).json({ success: false, message: 'Trip not found' });
        }

        const safeFormat = String(format || 'json').toLowerCase();
        const exportData = {
            title: trip.title,
            destination: trip.destination,
            dates: trip.dates,
            travelers: trip.travelers,
            preferences: trip.preferences,
            itinerary: trip.itinerary,
            totalEstimatedCost: trip.totalEstimatedCost,
            generatedAt: new Date().toISOString()
        };

        if (safeFormat === 'pdf') {
            const filename = `${trip.title.replace(/\s+/g, '_')}-itinerary.pdf`;

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            doc.pipe(res);

            const pageBottom = () => doc.page.height - doc.page.margins.bottom;
            const ensureSpace = (required = 60) => {
                if (doc.y + required > pageBottom()) {
                    doc.addPage();
                }
            };

            const formatDate = (dateValue) => {
                try {
                    return new Date(dateValue).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    });
                } catch {
                    return String(dateValue || '');
                }
            };

            const currencyCode = trip?.preferences?.currency || 'USD';
            const formatMoney = (amount) => {
                const value = toNumber(amount, 0);
                try {
                    return new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: currencyCode,
                        maximumFractionDigits: 0
                    }).format(value);
                } catch {
                    return `${value}`;
                }
            };

            doc.fontSize(20).font('Helvetica-Bold').fillColor('#111827').text(trip.title);
            doc.moveDown(0.3);
            doc.fontSize(11).font('Helvetica').fillColor('#374151')
                .text(`${trip.destination.city}, ${trip.destination.country}`)
                .text(`Duration: ${trip.dates.duration} days (${formatDate(trip.dates.startDate)} - ${formatDate(trip.dates.endDate)})`)
                .text(`Travelers: ${trip.travelers.adults} adults, ${trip.travelers.children} children`)
                .text(`Budget: ${trip.preferences?.budgetType || 'mid-range'}`)
                .text(`Generated: ${formatDate(new Date())}`);

            doc.moveDown(1);
            ensureSpace(100);
            doc.fontSize(14).font('Helvetica-Bold').fillColor('#111827').text('Budget Summary');
            doc.moveDown(0.4);

            const selectedBudget = (trip.preferences?.budgetType === 'mid-range' ? 'midRange' : trip.preferences?.budgetType) || 'midRange';
            const budgetData = trip.totalEstimatedCost?.[selectedBudget] || {};
            doc.fontSize(11).font('Helvetica').fillColor('#374151')
                .text(`Estimated Total (${selectedBudget === 'midRange' ? 'mid-range' : selectedBudget}): ${formatMoney(budgetData.total)}`)
                .text(`Accommodation: ${formatMoney(budgetData.accommodation)} | Food: ${formatMoney(budgetData.food)} | Activities: ${formatMoney(budgetData.activities)} | Transport: ${formatMoney(budgetData.transport)}`);

            doc.moveDown(1);
            ensureSpace(120);
            doc.fontSize(14).font('Helvetica-Bold').fillColor('#111827').text('Day-wise Itinerary');
            doc.moveDown(0.5);

            (trip.itinerary || []).forEach((day) => {
                ensureSpace(80);

                doc.fontSize(12).font('Helvetica-Bold').fillColor('#111827')
                    .text(`Day ${day.day} - ${formatDate(day.date)}`);

                const activities = Array.isArray(day.activities) ? day.activities : [];
                if (activities.length === 0) {
                    doc.fontSize(10).font('Helvetica').fillColor('#6B7280').text('No activities added.');
                    doc.moveDown(0.6);
                    return;
                }

                activities.forEach((activity) => {
                    ensureSpace(70);
                    const title = activity?.title || 'Activity';
                    const locationName = activity?.location?.name || '';
                    const timeText = activity?.time || '--:--';
                    const duration = activity?.estimatedDuration || activity?.duration || 60;
                    const description = (activity?.description || '').trim();
                    const cost = activity?.estimatedCost?.[selectedBudget] ?? activity?.estimatedCost?.midRange ?? activity?.estimatedCost?.budget;

                    doc.fontSize(10).font('Helvetica-Bold').fillColor('#1F2937')
                        .text(`${timeText}  ${title}`);

                    doc.fontSize(10).font('Helvetica').fillColor('#374151')
                        .text(`Location: ${locationName || 'N/A'}`)
                        .text(`Duration: ${duration} min${cost !== undefined ? `  |  Est. Cost: ${formatMoney(cost)}` : ''}`);

                    if (description) {
                        doc.text(`Note: ${description}`, { width: 500 });
                    }

                    doc.moveDown(0.5);
                });

                doc.moveDown(0.5);
            });

            doc.end();
            return;
        }

        if (safeFormat === 'txt') {
            const lines = [];
            lines.push(`${trip.title}`);
            lines.push(`${trip.destination.city}, ${trip.destination.country}`);
            lines.push(`Duration: ${trip.dates.duration} days`);
            lines.push('');

            (trip.itinerary || []).forEach((day) => {
                lines.push(`Day ${day.day} - ${new Date(day.date).toDateString()}`);
                (day.activities || []).forEach((activity) => {
                    const title = activity?.title || 'Activity';
                    const location = activity?.location?.name || '';
                    lines.push(`- ${activity.time || ''} ${title}${location ? ` (${location})` : ''}`);
                });
                lines.push('');
            });

            const textContent = lines.join('\n');
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${trip.title.replace(/\s+/g, '_')}-itinerary.txt"`);
            return res.status(200).send(textContent);
        }

        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${trip.title.replace(/\s+/g, '_')}-itinerary.json"`);
        return res.status(200).send(JSON.stringify(exportData, null, 2));
    } catch (error) {
        console.error('Error exporting trip:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to export trip'
        });
    }
};

// Optimize route and map integration (Feature 5)
export const optimizeRoute = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { selectedDay, customLocations } = req.body;
        const userId = req.user._id;

        const trip = await Trip.findOne({ _id: tripId, user: userId });
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }

        const dayItinerary = trip.itinerary.find(day => day.day === selectedDay);
        if (!dayItinerary) {
            return res.status(404).json({
                success: false,
                message: 'Day not found in itinerary'
            });
        }

        // Include custom locations if provided
        const allLocations = [
            ...dayItinerary.activities.map(activity => ({
                name: activity.activity,
                location: activity.location,
                duration: activity.duration,
                category: activity.category
            })),
            ...(customLocations || [])
        ];

        const prompt = `
Optimize the route for a day trip in ${trip.destination.city}, ${trip.destination.country}.

Locations to visit:
${allLocations.map((loc, index) => `${index + 1}. ${loc.name} at ${loc.location} (${loc.duration} minutes, ${loc.category})`).join('\n')}

Transportation mode: ${trip.preferences.transportationMode}
Activity level: ${trip.preferences.activityLevel}

IMPORTANT: Respond with ONLY valid JSON. No markdown code blocks, no comments, no additional text.

Please provide an optimized route in JSON format:
{
  "optimizedRoute": [
    {
      "order": 1,
      "location": "location name",
      "address": "specific address",
      "coordinates": {
        "lat": latitude,
        "lng": longitude
      },
      "arrivalTime": "HH:MM",
      "departureTime": "HH:MM",
      "duration": "time spent here",
      "travelTimeToNext": "travel time to next location",
      "transportMethod": "walking/driving/public transport",
      "notes": "routing notes"
    }
  ],
  "routeSummary": {
    "totalDistance": "total distance",
    "totalTravelTime": "total travel time",
    "totalDuration": "total day duration",
    "startTime": "suggested start time",
    "endTime": "estimated end time",
    "transportationCost": estimated_cost
  },
  "routeOptimizations": [
    {
      "type": "time/distance/cost savings",
      "description": "optimization made",
      "benefit": "benefit description"
    }
  ],
  "mapData": {
    "waypoints": [
      {
        "lat": latitude,
        "lng": longitude,
        "name": "location name"
      }
    ],
    "routePolyline": "encoded polyline for map display"
  }
}

Optimize for minimal travel time while considering opening hours, crowd levels, and logical flow between activities.

Return ONLY the JSON object above. No additional text, explanations, or markdown formatting.`;

        let text = await generateAIContent(prompt);

        // Clean the response text
        // Remove markdown code blocks
        text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        // Remove comments from JSON (lines starting with // and /* */ blocks)
        text = text.replace(/\/\/.*$/gm, '');
        text = text.replace(/\/\*[\s\S]*?\*\//g, '');
        
        // Remove trailing commas before closing brackets/braces
        text = text.replace(/,(\s*[}\]])/g, '$1');

        let routeData;
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                routeData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No valid JSON found in response');
            }
        } catch (parseError) {
            console.error('Error parsing route optimization response:', parseError);
            return res.status(500).json({
                success: false,
                message: 'Error processing route optimization'
            });
        }

        res.status(200).json({
            success: true,
            routeData: routeData
        });

    } catch (error) {
        console.error('Error optimizing route:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to optimize route'
        });
    }
};
