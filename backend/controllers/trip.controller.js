import { GoogleGenerativeAI } from '@google/generative-ai';
import { Trip } from '../models/trip.model.js';
import User from '../models/user.model.js';

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY;
console.log('Gemini API Key available:', apiKey ? 'Yes' : 'No');

if (!apiKey) {
    console.error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

        // Create detailed prompt for Gemini
        console.log('Creating enhanced prompt for Gemini API...');
        const prompt = `You are an expert travel planner with deep local knowledge and 15+ years of experience. Create an exceptional, detailed ${trip.dates.duration}-day travel itinerary for ${trip.destination.city}, ${trip.destination.country}.

Trip Details:
- Duration: ${trip.dates.duration} days
- Travelers: ${trip.travelers.adults} adults, ${trip.travelers.children} children
- Budget Type: ${trip.preferences.budgetType}
- Interests: ${trip.preferences.interests.join(', ')}
- Travel Style: ${trip.preferences.travelStyle}
- Pace: ${trip.preferences.pace}

ENHANCED PLANNING REQUIREMENTS:
🎯 **Expert Local Insights**: Include hidden gems, local favorites, and authentic experiences only locals know
⏰ **Smart Scheduling**: Consider opening hours, weather patterns, crowd levels, and optimal timing for each activity
🗺️ **Practical Navigation**: Calculate realistic travel times and suggest best transportation between locations
💰 **Budget Optimization**: Maximize value within the specified budget range with money-saving tips
🌍 **Cultural Context**: Include local customs, etiquette, cultural significance, and language basics
🛡️ **Safety & Backup Plans**: Emergency contacts, safety tips, and alternative plans for weather/closures
📱 **Booking Intelligence**: Specify what needs advance booking and provide booking tips

BUDGET COST GUIDELINES:
- Budget: Accommodation $30-80/night, Meals $15-30/day, Activities $10-25 each
- Mid-range: Accommodation $80-200/night, Meals $30-60/day, Activities $25-50 each  
- Luxury: Accommodation $200+/night, Meals $60+/day, Activities $50+ each

IMPORTANT: Respond with ONLY valid JSON. No markdown code blocks, no comments, no additional text.

Please provide a JSON response with the following structure:
{
  "itinerary": [
    {
      "day": 1,
      "date": "2025-09-09",
      "theme": "Arrival and Cultural Immersion",
      "weather_advice": "Check forecast - indoor backup options listed",
      "local_insight": "Insider tip about this day's plan",
      "activities": [
        {
          "time": "09:00",
          "activity": "Private Airport Transfer with Local Welcome",
          "description": "Professional transfer with local guide introduction and city overview during ride",
          "location": "Charles de Gaulle Airport to Le Marais District Hotel, 75004 Paris",
          "address": "Specific hotel address with postal code",
          "category": "transport",
          "duration": "60",
          "estimatedCost": {
            "budget": 25,
            "midRange": 50,
            "luxury": 100
          },
          "tips": "Download offline maps beforehand, keep passport handy, ask driver for local SIM card recommendations",
          "booking_required": true,
          "operating_hours": "24/7",
          "priority": "high",
          "backup_plan": "Public RER B train if transfer is delayed",
          "cultural_note": "French drivers appreciate a simple 'Bonjour' greeting"
        }
      ],
      "daily_budget_breakdown": {
        "budget": 85,
        "midRange": 140,
        "luxury": 280
      },
      "walking_distance": "2.5 km total",
      "emergency_contacts": "Tourist Police: +33 1 53 71 53 71, Medical Emergency: 15"
    }
  ],
  "totalEstimatedCost": {
    "budget": {
      "accommodation": 500,
      "food": 300,
      "activities": 200,
      "transport": 150,
      "miscellaneous": 100,
      "total": 1250
    },
    "midRange": {
      "accommodation": 1000,
      "food": 600,
      "activities": 400,
      "transport": 250,
      "miscellaneous": 200,
      "total": 2450
    },
    "luxury": {
      "accommodation": 2000,
      "food": 1200,
      "activities": 800,
      "transport": 500,
      "miscellaneous": 400,
      "total": 4900
    }
  },
  "travel_intelligence": {
    "best_time_to_visit": "Detailed weather and crowd information",
    "cultural_etiquette": "Essential customs and social norms",
    "packing_essentials": "Climate-specific items and local requirements",
    "language_basics": "10 most important phrases with pronunciation",
    "currency_wisdom": "Best exchange methods and tipping culture",
    "safety_insights": "Area-specific safety tips and emergency procedures",
    "local_apps": "Essential apps for navigation, food, and transport",
    "hidden_gems": "Secret spots only locals know about"
  }
}

STRICT FORMATTING RULES:
- Use ONLY these category values: 'sightseeing', 'food', 'shopping', 'adventure', 'relaxation', 'transport', 'accommodation', 'nightlife'
- Never use 'activity' - use 'sightseeing' instead
- Never combine categories with commas - use only one category per activity
- All costs must be realistic numbers (no ranges)
- Include exact times in HH:MM format
- All locations must have specific names and full addresses
- Priority levels: 'high', 'medium', 'low'
- Duration in minutes as numbers only

Create an itinerary that feels like it was crafted by a local expert who genuinely cares about providing an authentic, safe, and unforgettable experience.

Return ONLY the JSON object above. No additional text, explanations, or markdown formatting.`;

        console.log('Sending request to Gemini API...');
        try {
            const result = await model.generateContent(prompt);
            console.log('Received response from Gemini API');
            const response = await result.response;
            let text = response.text();
            console.log('Raw Gemini response:', text.substring(0, 500) + '...');
            
            // Clean the response text
            // Remove markdown code blocks
            text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
            
            // Remove comments from JSON (lines starting with // and /* */ blocks)
            text = text.replace(/\/\/.*$/gm, '');
            text = text.replace(/\/\*[\s\S]*?\*\//g, '');
            
            // Remove trailing commas before closing brackets/braces
            text = text.replace(/,(\s*[}\]])/g, '$1');
            
            console.log('Cleaned response text:', text.substring(0, 500) + '...');
            
            // Parse the JSON response
            let aiResponse;
            try {
                // Extract JSON from the response (in case there's additional text)
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    aiResponse = JSON.parse(jsonMatch[0]);
                    console.log('Successfully parsed AI response');
                } else {
                    throw new Error('No valid JSON found in response');
                }
            } catch (parseError) {
                console.error('Error parsing AI response:', parseError);
                console.error('Full response text:', text);
                return res.status(500).json({
                    success: false,
                    message: 'Error processing AI response',
                    error: parseError.message
                });
            }

            // Update trip with generated itinerary
            trip.itinerary = aiResponse.itinerary;
            trip.totalEstimatedCost = aiResponse.totalEstimatedCost;
            trip.status = 'generated';

            await trip.save();
            console.log('Trip updated successfully with AI itinerary');

            res.status(200).json({
                success: true,
                message: 'Itinerary generated successfully',
                trip: trip
            });
        } catch (geminiError) {
            console.error('Gemini API Error:', geminiError);
            return res.status(500).json({
                success: false,
                message: 'Failed to generate itinerary with AI',
                error: geminiError.message
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

        const prompt = `
You are a local expert and insider guide for ${trip.destination.city}, ${trip.destination.country}. Generate curated, personalized recommendations that go beyond typical tourist attractions.

Trip Context:
- Duration: ${trip.dates.duration} days
- Budget Type: ${trip.budgetType || trip.preferences.budgetType}
- Interests: ${trip.preferences.interests.join(', ')}
- Dining Style: ${trip.preferences.diningStyle || 'varied'}
- Activity Level: ${trip.preferences.activityLevel || 'moderate'}
- Travelers: ${trip.travelers.adults} adults, ${trip.travelers.children} children

EXPERT CURATION REQUIREMENTS:
🍽️ **Restaurants**: Mix of local favorites, hidden gems, and Instagram-worthy spots
🏛️ **Attractions**: Balance iconic sights with lesser-known treasures
🎭 **Events**: Current happenings, seasonal festivals, and unique experiences
💎 **Hidden Gems**: Secret spots only locals know - viewpoints, neighborhoods, experiences
🛍️ **Shopping**: From local markets to unique boutiques and souvenir spots

CRITICAL JSON REQUIREMENTS:
- Respond with ONLY valid JSON. No markdown, no code blocks, no extra text.
- All string values MUST be enclosed in double quotes
- Use 0 instead of "Free" for numeric fields
- Boolean values: true/false (no quotes)
- Numbers: no quotes around numeric values
- All property names MUST be in double quotes

Please provide recommendations in the following JSON format:
{
  "restaurants": [
    {
      "name": "Le Comptoir du Relais",
      "description": "Quintessential Parisian bistro beloved by locals, famous for its traditional French cuisine and intimate atmosphere",
      "location": "9 Carrefour de l'Odéon, 75006 Paris",
      "coordinates": {"lat": 48.8512, "lng": 2.3391},
      "rating": 4.6,
      "priceRange": "midRange",
      "cuisine": "French Bistro",
      "tags": ["local favorite", "authentic", "intimate", "traditional"],
      "specialties": ["Confit de canard", "Tarte Tatin", "Natural wines"],
      "averageCost": 45,
      "reservationRequired": true,
      "openingHours": "Mon-Sat 12:00-14:30, 19:00-23:00",
      "insider_tip": "Book weeks ahead, arrive early for bar seating without reservation",
      "best_dishes": ["Duck confit", "Daily specials on blackboard"],
      "ambiance": "Cozy, bustling, authentic Parisian"
    }
  ],
  "attractions": [
    {
      "name": "Musée Rodin Secret Gardens",
      "description": "While tourists rush through the museum, locals know the real magic is in the hidden corners of the sculpture garden",
      "location": "77 Rue de Varenne, 75007 Paris",
      "coordinates": {"lat": 48.8553, "lng": 2.3159},
      "rating": 4.7,
      "priceRange": "budget",
      "category": "museum",
      "tags": ["sculpture", "gardens", "peaceful", "artistic"],
      "duration": "2-3 hours",
      "bestTimeToVisit": "Late afternoon for golden hour photography",
      "entranceFee": 14,
      "insider_tip": "Visit the Rose Garden in June for peak blooms, skip the crowds by entering through the back entrance",
      "photography_spots": ["The Thinker at sunset", "Secret garden nooks"],
      "nearby_combo": "Walk to Invalides after for Napoleon's Tomb"
    }
  ],
  "events": [
    {
      "name": "Sunday Jazz at Sunset - Pont des Arts",
      "description": "Local musicians gather every Sunday for impromptu jazz sessions with stunning Seine views",
      "location": "Pont des Arts, 75001 Paris",
      "coordinates": {"lat": 48.8583, "lng": 2.3370},
      "rating": 4.8,
      "priceRange": "budget",
      "type": "music",
      "tags": ["free", "jazz", "sunset", "local culture"],
      "schedule": "Sundays 18:00-20:30 (weather permitting)",
      "ticketPrice": 0,
      "insider_tip": "Bring a blanket and wine from nearby shop, musicians appreciate small donations",
      "seasonal_note": "Most active April-October",
      "what_to_bring": ["Blanket", "Snacks", "Cash for tips"]
    }
  ],
  "hiddenGems": [
    {
      "name": "Promenade Plantée Secret Entrance",
      "description": "Elevated garden walkway above the city - enter through the hidden staircase near Bastille for the best sunset views",
      "location": "Near 1 Coulée Verte René-Dumont, 75012 Paris",
      "coordinates": {"lat": 48.8476, "lng": 2.3691},
      "rating": 4.9,
      "priceRange": "budget",
      "type": "viewpoint",
      "tags": ["elevated views", "peaceful", "photography", "free"],
      "whySpecial": "First elevated park in the world, built on old railway viaduct with incredible city views",
      "bestTimeToVisit": "Golden hour (1 hour before sunset)",
      "insider_tip": "Enter at Arts et Métiers viaduct for least crowds, continues for 4.7km if you want to walk",
      "photography_gold": "Viaduct arches frame the city perfectly",
      "local_secret": "Bench at kilometer marker 2.3 has the best skyline view"
    }
  ],
  "shopping": [
    {
      "name": "Marché Saint-Germain Underground",
      "description": "Hidden covered market beneath the famous square, where locals shop for gourmet foods and unique artisan goods",
      "location": "4-8 Rue Lobineau, 75006 Paris",
      "coordinates": {"lat": 48.8530, "lng": 2.3359},
      "rating": 4.5,
      "priceRange": "midRange",
      "type": "market",
      "tags": ["gourmet", "artisan", "covered market", "local products"],
      "specialties": ["Artisan chocolates", "French cheeses", "Vintage books", "Handmade jewelry"],
      "openingHours": "Tue-Sat 08:00-20:00, Sun 08:00-14:00",
      "insider_tip": "Visit Saturday morning for the best selection, many vendors offer tastings",
      "local_vendors": ["Fromager Laurent for best cheese selection", "Chocolate maker Sophie for unique flavors"],
      "bargaining_culture": "Fixed prices, but vendors appreciate genuine interest in their craft"
    }
  ],
  "transportation_hacks": [
    {
      "type": "Metro Secret",
      "tip": "Line 1 is fully automated and has platform screen doors - safest for families",
      "money_saver": "Weekly Navigo pass pays for itself after 14 single rides"
    }
  ],
  "local_etiquette": [
    "Always say 'Bonjour' when entering shops",
    "Dinner reservations essential, lunch can be more spontaneous",
    "Tipping 10% is appreciated but not mandatory"
  ]
}

Focus on recommendations that match the traveler's interests and budget type. Include 4-6 items in each category with insider knowledge that only a local expert would know. All locations must be real and currently operating in ${trip.destination.city}.

Return ONLY the JSON object above. No additional text, explanations, or markdown formatting.`;

        // Make API call with retry logic
        const result = await retryWithBackoff(async () => {
            return await model.generateContent(prompt);
        });
        
        const response = await result.response;
        let text = response.text();

        // Enhanced cleaning of the response text
        console.log('Raw AI response length:', text.length);
        
        // Remove markdown code blocks
        text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        // Remove comments from JSON (lines starting with // and /* */ blocks)
        text = text.replace(/\/\/.*$/gm, '');
        text = text.replace(/\/\*[\s\S]*?\*\//g, '');
        
        // Fix common JSON issues
        // Fix unquoted values
        text = text.replace(/:\s*([A-Za-z][A-Za-z0-9\s]*[A-Za-z0-9])\s*([,\}\]])/g, ': "$1"$2');
        text = text.replace(/:\s*Free\s*([,\}\]])/g, ': 0$1');
        text = text.replace(/:\s*free\s*([,\}\]])/g, ': 0$1');
        text = text.replace(/:\s*([a-zA-Z]+)\s*([,\}\]])/g, (match, word, ending) => {
            // Don't quote boolean values
            if (word === 'true' || word === 'false' || word === 'null') {
                return `: ${word}${ending}`;
            }
            // Don't quote numbers
            if (!isNaN(word)) {
                return `: ${word}${ending}`;
            }
            return `: "${word}"${ending}`;
        });
        
        // Remove trailing commas before closing brackets/braces
        text = text.replace(/,(\s*[}\]])/g, '$1');
        
        // Fix broken quotes
        text = text.replace(/([^\\])\\"/g, '$1"');
        text = text.replace(/"\s*([A-Za-z])/g, '" $1');

        // Parse the JSON response
        let recommendations;
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                console.log('Attempting to parse JSON...');
                recommendations = JSON.parse(jsonMatch[0]);
                console.log('Successfully parsed recommendations');
                
                // Clean up any keys with leading/trailing spaces
                const cleanedRecommendations = {};
                Object.keys(recommendations).forEach(key => {
                    const cleanKey = key.trim();
                    cleanedRecommendations[cleanKey] = recommendations[key];
                });
                recommendations = cleanedRecommendations;
                console.log('Cleaned recommendation keys:', Object.keys(recommendations));
            } else {
                throw new Error('No valid JSON found in response');
            }
        } catch (parseError) {
            console.error('Error parsing recommendations response:', parseError);
            console.error('Problematic text snippet:', text.substring(0, 500));
            
            // Return error instead of fallback data
            throw new Error('Failed to parse AI recommendations response');
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

        const prompt = `
Get current real-time travel information for ${trip.destination.city}, ${trip.destination.country}.

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

Provide realistic and current information. If specific real-time data is not available, provide general seasonal/typical information for the destination.

Return ONLY the JSON object above. No additional text, explanations, or markdown formatting.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean the response text
        // Remove markdown code blocks
        text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        // Remove comments from JSON (lines starting with // and /* */ blocks)
        text = text.replace(/\/\/.*$/gm, '');
        text = text.replace(/\/\*[\s\S]*?\*\//g, '');
        
        // Remove trailing commas before closing brackets/braces
        text = text.replace(/,(\s*[}\]])/g, '$1');

        let realTimeInfo;
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                realTimeInfo = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No valid JSON found in response');
            }
        } catch (parseError) {
            console.error('Error parsing real-time info response:', parseError);
            return res.status(500).json({
                success: false,
                message: 'Error processing real-time information'
            });
        }

        res.status(200).json({
            success: true,
            realTimeInfo: realTimeInfo
        });

    } catch (error) {
        console.error('Error getting real-time info:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get real-time information'
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

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

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
