import { GoogleGenerativeAI } from '@google/generative-ai';
import { Trip } from '../models/trip.model.js';
import { User } from '../models/user.model.js';

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY;
console.log('Gemini API Key available:', apiKey ? 'Yes' : 'No');

if (!apiKey) {
    console.error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

        const userId = req.id;
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
        const userId = req.id;

        const trip = await Trip.findOne({ _id: tripId, user: userId });
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }

        // Create detailed prompt for Gemini
        console.log('Creating prompt for Gemini API...');
        const prompt = `Generate a detailed ${trip.dates.duration}-day travel itinerary for ${trip.destination.city}, ${trip.destination.country}.

Trip Details:
- Duration: ${trip.dates.duration} days
- Travelers: ${trip.travelers.adults} adults, ${trip.travelers.children} children
- Budget Type: ${trip.preferences.budgetType}
- Interests: ${trip.preferences.interests.join(', ')}
- Travel Style: ${trip.preferences.travelStyle}
- Pace: ${trip.preferences.pace}

IMPORTANT: Respond with ONLY valid JSON. No markdown code blocks, no comments, no additional text.

Please provide a JSON response with the following structure:
{
  "itinerary": [
    {
      "day": 1,
      "date": "2025-09-09",
      "theme": "Arrival and City Introduction",
      "activities": [
        {
          "time": "09:00",
          "activity": "Airport Transfer",
          "description": "Private transfer from airport to hotel",
          "location": "Charles de Gaulle Airport to Paris City Center",
          "category": "transport",
          "duration": "60",
          "estimatedCost": {
            "budget": 25,
            "midRange": 50,
            "luxury": 100
          },
          "tips": "Book in advance for better rates"
        }
      ]
    }
  ],
  "totalEstimatedCost": {
    "budget": {
      "accommodation": 500,
      "food": 300,
      "activities": 200,
      "transport": 150,
      "total": 1150
    },
    "midRange": {
      "accommodation": 1000,
      "food": 600,
      "activities": 400,
      "transport": 250,
      "total": 2250
    },
    "luxury": {
      "accommodation": 2000,
      "food": 1200,
      "activities": 800,
      "transport": 500,
      "total": 4500
    }
  }
}

IMPORTANT RULES:
- Use ONLY these category values: 'sightseeing', 'food', 'shopping', 'adventure', 'relaxation', 'transport', 'accommodation', 'nightlife'
- Never use 'activity' - use 'sightseeing' instead
- Never combine categories with commas - use only one category per activity

Make sure the itinerary is realistic, considers travel time between locations, includes meals, and matches the traveler preferences and budget type. Include specific location names and practical tips.

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
        const userId = req.id;

        const trip = await Trip.findOne({ _id: tripId, user: userId });
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }

        const prompt = `
Generate personalized recommendations for a trip to ${trip.destination.city}, ${trip.destination.country}.

Trip Details:
- Duration: ${trip.dates.duration} days
- Budget Type: ${trip.budgetType}
- Interests: ${trip.preferences.interests.join(', ')}
- Dining Style: ${trip.preferences.diningStyle}
- Activity Level: ${trip.preferences.activityLevel}
- Travelers: ${trip.travelers.adults} adults, ${trip.travelers.children} children

IMPORTANT: Respond with ONLY valid JSON. No markdown code blocks, no comments, no additional text.

Please provide recommendations in the following JSON format:
{
  "restaurants": [
    {
      "name": "Restaurant Name",
      "description": "Brief description",
      "location": "Address or area",
      "rating": 4.5,
      "priceRange": "budget/midRange/luxury",
      "cuisine": "cuisine type",
      "tags": ["tag1", "tag2", "tag3"],
      "specialties": ["dish1", "dish2"],
      "averageCost": number
    }
  ],
  "attractions": [
    {
      "name": "Attraction Name",
      "description": "Brief description",
      "location": "Address or area",
      "rating": 4.5,
      "priceRange": "budget/midRange/luxury",
      "category": "museum/landmark/nature/entertainment",
      "tags": ["tag1", "tag2", "tag3"],
      "duration": "recommended visit duration",
      "bestTimeToVisit": "time recommendation",
      "entranceFee": number
    }
  ],
  "events": [
    {
      "name": "Event Name",
      "description": "Brief description",
      "location": "Venue",
      "rating": 4.5,
      "priceRange": "budget/midRange/luxury",
      "type": "cultural/music/sports/festival",
      "tags": ["tag1", "tag2", "tag3"],
      "schedule": "timing information",
      "ticketPrice": number
    }
  ],
  "hiddenGems": [
    {
      "name": "Hidden Gem Name",
      "description": "Brief description",
      "location": "Address or area",
      "rating": 4.5,
      "priceRange": "budget/midRange/luxury",
      "type": "viewpoint/local spot/unique experience",
      "tags": ["tag1", "tag2", "tag3"],
      "whySpecial": "what makes it unique",
      "bestTimeToVisit": "time recommendation"
    }
  ],
  "shopping": [
    {
      "name": "Shopping Place Name",
      "description": "Brief description",
      "location": "Address or area",
      "rating": 4.5,
      "priceRange": "budget/midRange/luxury",
      "type": "market/mall/boutique/souvenir",
      "tags": ["tag1", "tag2", "tag3"],
      "specialties": ["item1", "item2"],
      "openingHours": "business hours"
    }
  ]
}

Focus on recommendations that match the traveler's interests and budget type. Include 3-5 items in each category. Make sure all recommendations are real places in ${trip.destination.city}.

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

        // Parse the JSON response
        let recommendations;
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                recommendations = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No valid JSON found in response');
            }
        } catch (parseError) {
            console.error('Error parsing recommendations response:', parseError);
            return res.status(500).json({
                success: false,
                message: 'Error processing AI recommendations'
            });
        }

        res.status(200).json({
            success: true,
            recommendations: recommendations
        });

    } catch (error) {
        console.error('Error getting smart recommendations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get recommendations'
        });
    }
};

// Get user's trips
export const getUserTrips = async (req, res) => {
    try {
        const userId = req.id;
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
        const userId = req.id;

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
        const userId = req.id;
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
        const userId = req.id;

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
        const userId = req.id;

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
        const userId = req.id;

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
