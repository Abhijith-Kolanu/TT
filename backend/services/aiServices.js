// Simulated AI service for generating itineraries
// In production, this would integrate with OpenAI, Google AI, or other AI services
class AIItineraryService {
    static async generateItinerary(destination, dates, preferences, travelers) {
        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { startDate, endDate, duration } = dates;
        const { budgetType, interests, travelStyle, pace } = preferences;
        
        // Sample destinations database (in production, this would be from a comprehensive travel API)
        const destinationData = this.getDestinationData(destination.city, destination.country);
        
        // Generate day-wise itinerary
        const itinerary = [];
        
        for (let day = 1; day <= duration; day++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(currentDate.getDate() + day - 1);
            
            const dayPlan = this.generateDayPlan(day, currentDate, destinationData, preferences, travelers);
            itinerary.push(dayPlan);
        }
        
        // Calculate total estimated costs
        const totalCosts = this.calculateTotalCosts(itinerary, duration, travelers);
        
        return { itinerary, totalCosts };
    }
    
    static getDestinationData(city, country) {
        // Sample data - in production this would come from travel APIs
        const destinations = {
            "Paris": {
                attractions: [
                    { name: "Eiffel Tower", coordinates: [2.2945, 48.8584], category: "sightseeing", duration: 120 },
                    { name: "Louvre Museum", coordinates: [2.3376, 48.8606], category: "sightseeing", duration: 180 },
                    { name: "Notre-Dame Cathedral", coordinates: [2.3499, 48.8530], category: "sightseeing", duration: 90 },
                    { name: "Montmartre", coordinates: [2.3412, 48.8867], category: "sightseeing", duration: 150 },
                    { name: "Seine River Cruise", coordinates: [2.3522, 48.8566], category: "relaxation", duration: 60 }
                ],
                restaurants: [
                    { name: "Le Comptoir du Relais", coordinates: [2.3376, 48.8506], cuisine: "French", priceRange: "mid-range" },
                    { name: "L'As du Fallafel", coordinates: [2.3590, 48.8577], cuisine: "Middle Eastern", priceRange: "budget" },
                    { name: "Le Jules Verne", coordinates: [2.2945, 48.8584], cuisine: "Fine Dining", priceRange: "luxury" }
                ]
            },
            "Tokyo": {
                attractions: [
                    { name: "Senso-ji Temple", coordinates: [139.7967, 35.7148], category: "sightseeing", duration: 90 },
                    { name: "Tokyo Skytree", coordinates: [139.8107, 35.7101], category: "sightseeing", duration: 120 },
                    { name: "Shibuya Crossing", coordinates: [139.7006, 35.6598], category: "sightseeing", duration: 60 },
                    { name: "Tsukiji Outer Market", coordinates: [139.7677, 35.6654], category: "food", duration: 120 }
                ],
                restaurants: [
                    { name: "Sushi Dai", coordinates: [139.7677, 35.6654], cuisine: "Japanese", priceRange: "mid-range" },
                    { name: "Ichiran Ramen", coordinates: [139.7006, 35.6598], cuisine: "Japanese", priceRange: "budget" }
                ]
            }
        };
        
        return destinations[city] || destinations["Paris"]; // Fallback to Paris
    }
    
    static generateDayPlan(day, date, destinationData, preferences, travelers) {
        const activities = [];
        
        // Morning activity (9:00 AM)
        const morningAttraction = destinationData.attractions[Math.floor(Math.random() * destinationData.attractions.length)];
        activities.push({
            time: "09:00 AM",
            title: `Visit ${morningAttraction.name}`,
            description: `Explore one of the most iconic attractions. Perfect for ${preferences.travelStyle} travelers.`,
            location: {
                coordinates: morningAttraction.coordinates,
                name: morningAttraction.name,
                address: `${morningAttraction.name} Address`
            },
            estimatedDuration: morningAttraction.duration,
            category: morningAttraction.category,
            estimatedCost: this.getActivityCost(morningAttraction.category, travelers)
        });
        
        // Lunch (12:30 PM)
        const lunchSpot = destinationData.restaurants[Math.floor(Math.random() * destinationData.restaurants.length)];
        activities.push({
            time: "12:30 PM",
            title: `Lunch at ${lunchSpot.name}`,
            description: `Enjoy authentic ${lunchSpot.cuisine} cuisine at this ${lunchSpot.priceRange} restaurant.`,
            location: {
                coordinates: lunchSpot.coordinates,
                name: lunchSpot.name,
                address: `${lunchSpot.name} Address`
            },
            estimatedDuration: 90,
            category: "food",
            estimatedCost: this.getFoodCost(lunchSpot.priceRange, travelers, "lunch")
        });
        
        // Afternoon activity (2:30 PM)
        let afternoonAttraction;
        do {
            afternoonAttraction = destinationData.attractions[Math.floor(Math.random() * destinationData.attractions.length)];
        } while (afternoonAttraction.name === morningAttraction.name);
        
        activities.push({
            time: "02:30 PM",
            title: `Explore ${afternoonAttraction.name}`,
            description: `Continue your adventure with another must-see location.`,
            location: {
                coordinates: afternoonAttraction.coordinates,
                name: afternoonAttraction.name,
                address: `${afternoonAttraction.name} Address`
            },
            estimatedDuration: afternoonAttraction.duration,
            category: afternoonAttraction.category,
            estimatedCost: this.getActivityCost(afternoonAttraction.category, travelers)
        });
        
        // Dinner (7:00 PM)
        let dinnerSpot;
        do {
            dinnerSpot = destinationData.restaurants[Math.floor(Math.random() * destinationData.restaurants.length)];
        } while (dinnerSpot.name === lunchSpot.name);
        
        activities.push({
            time: "07:00 PM",
            title: `Dinner at ${dinnerSpot.name}`,
            description: `End your day with a delightful dinner experience.`,
            location: {
                coordinates: dinnerSpot.coordinates,
                name: dinnerSpot.name,
                address: `${dinnerSpot.name} Address`
            },
            estimatedDuration: 120,
            category: "food",
            estimatedCost: this.getFoodCost(dinnerSpot.priceRange, travelers, "dinner")
        });
        
        return {
            day,
            date,
            activities
        };
    }
    
    static getActivityCost(category, travelers) {
        const baseCosts = {
            sightseeing: { budget: 15, midRange: 25, luxury: 50 },
            adventure: { budget: 30, midRange: 60, luxury: 120 },
            relaxation: { budget: 20, midRange: 40, luxury: 80 },
            shopping: { budget: 50, midRange: 100, luxury: 300 }
        };
        
        const costs = baseCosts[category] || baseCosts.sightseeing;
        const totalTravelers = travelers.adults + travelers.children;
        
        return {
            budget: costs.budget * totalTravelers,
            midRange: costs.midRange * totalTravelers,
            luxury: costs.luxury * totalTravelers
        };
    }
    
    static getFoodCost(priceRange, travelers, mealType) {
        const mealCosts = {
            breakfast: { budget: 8, midRange: 15, luxury: 30 },
            lunch: { budget: 12, midRange: 25, luxury: 50 },
            dinner: { budget: 20, midRange: 40, luxury: 80 }
        };
        
        const costs = mealCosts[mealType] || mealCosts.lunch;
        const totalTravelers = travelers.adults + travelers.children * 0.7; // Children eat less
        
        return {
            budget: Math.round(costs.budget * totalTravelers),
            midRange: Math.round(costs.midRange * totalTravelers),
            luxury: Math.round(costs.luxury * totalTravelers)
        };
    }
    
    static calculateTotalCosts(itinerary, duration, travelers) {
        let totalCosts = {
            budget: { accommodation: 0, food: 0, activities: 0, transport: 0, total: 0 },
            midRange: { accommodation: 0, food: 0, activities: 0, transport: 0, total: 0 },
            luxury: { accommodation: 0, food: 0, activities: 0, transport: 0, total: 0 }
        };
        
        // Calculate accommodation costs
        const accommodationPerNight = {
            budget: 50 * travelers.adults + 20 * travelers.children,
            midRange: 120 * travelers.adults + 40 * travelers.children,
            luxury: 300 * travelers.adults + 80 * travelers.children
        };
        
        Object.keys(totalCosts).forEach(tier => {
            totalCosts[tier].accommodation = accommodationPerNight[tier] * duration;
        });
        
        // Calculate activity and food costs from itinerary
        itinerary.forEach(day => {
            day.activities.forEach(activity => {
                Object.keys(totalCosts).forEach(tier => {
                    if (activity.category === 'food') {
                        totalCosts[tier].food += activity.estimatedCost[tier];
                    } else {
                        totalCosts[tier].activities += activity.estimatedCost[tier];
                    }
                });
            });
        });
        
        // Add transport costs (simplified)
        const transportCosts = {
            budget: 25 * duration,
            midRange: 50 * duration,
            luxury: 100 * duration
        };
        
        Object.keys(totalCosts).forEach(tier => {
            totalCosts[tier].transport = transportCosts[tier];
            totalCosts[tier].total = 
                totalCosts[tier].accommodation + 
                totalCosts[tier].food + 
                totalCosts[tier].activities + 
                totalCosts[tier].transport;
        });
        
        return totalCosts;
    }
}

// Simulated AI service for generating smart recommendations
class SmartRecommendationService {
    static async generateRecommendations(trip) {
        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const { destination, preferences, travelers, dates } = trip;
        
        // Generate personalized recommendations based on user preferences
        const recommendations = {
            restaurants: this.getRestaurantRecommendations(destination, preferences, travelers),
            attractions: this.getAttractionRecommendations(destination, preferences, travelers),
            events: this.getEventRecommendations(destination, dates, preferences),
            hiddenGems: this.getHiddenGemRecommendations(destination, preferences),
            shopping: this.getShoppingRecommendations(destination, preferences, travelers)
        };

        return recommendations;
    }

    static getRestaurantRecommendations(destination, preferences, travelers) {
        const restaurantDatabase = {
            "Paris": [
                {
                    id: 1,
                    name: "L'As du Fallafel",
                    type: "restaurant",
                    cuisine: "Middle Eastern",
                    description: "Famous falafel spot in the Marais district, perfect for budget travelers",
                    rating: 4.3,
                    priceRange: "budget",
                    coordinates: [2.3590, 48.8577],
                    address: "34 Rue des Rosiers, 75004 Paris",
                    tags: ["Street Food", "Vegetarian Friendly", "Local Favorite"],
                    openHours: "11:00 AM - 12:00 AM",
                    estimatedCost: { budget: 12, midRange: 12, luxury: 12 },
                    matchScore: 0.95,
                    reasons: ["Matches budget preference", "Vegetarian options", "Popular with locals"]
                },
                {
                    id: 2,
                    name: "Le Comptoir du Relais",
                    type: "restaurant",
                    cuisine: "French",
                    description: "Authentic French bistro with excellent wine selection and traditional dishes",
                    rating: 4.5,
                    priceRange: "mid-range",
                    coordinates: [2.3376, 48.8506],
                    address: "9 Carrefour de l'Odéon, 75006 Paris",
                    tags: ["French Cuisine", "Wine Bar", "Romantic"],
                    openHours: "12:00 PM - 11:00 PM",
                    estimatedCost: { budget: 45, midRange: 55, luxury: 55 },
                    matchScore: 0.88,
                    reasons: ["Great for couples", "Authentic French experience", "Good wine selection"]
                },
                {
                    id: 3,
                    name: "Le Jules Verne",
                    type: "restaurant",
                    cuisine: "French Fine Dining",
                    description: "Michelin-starred restaurant located in the Eiffel Tower with panoramic views",
                    rating: 4.7,
                    priceRange: "luxury",
                    coordinates: [2.2945, 48.8584],
                    address: "Eiffel Tower, Avenue Gustave Eiffel, 75007 Paris",
                    tags: ["Michelin Star", "Fine Dining", "Iconic Location"],
                    openHours: "7:00 PM - 10:00 PM",
                    estimatedCost: { budget: 200, midRange: 250, luxury: 300 },
                    matchScore: 0.75,
                    reasons: ["Luxury experience", "Unforgettable location", "World-class cuisine"]
                }
            ],
            "Tokyo": [
                {
                    id: 4,
                    name: "Sushi Dai",
                    type: "restaurant",
                    cuisine: "Japanese",
                    description: "World-famous sushi restaurant in Tsukiji, worth the early morning wait",
                    rating: 4.6,
                    priceRange: "mid-range",
                    coordinates: [139.7677, 35.6654],
                    address: "5 Chome-2-1 Tsukiji, Chuo City, Tokyo",
                    tags: ["Fresh Sushi", "Traditional", "Early Morning"],
                    openHours: "5:00 AM - 2:00 PM",
                    estimatedCost: { budget: 35, midRange: 45, luxury: 45 },
                    matchScore: 0.92,
                    reasons: ["Authentic experience", "Fresh ingredients", "Cultural significance"]
                }
            ]
        };

        const cityRestaurants = restaurantDatabase[destination.city] || restaurantDatabase["Paris"];
        
        // Filter and sort based on preferences
        return cityRestaurants
            .filter(restaurant => {
                if (preferences.budgetType === 'budget' && restaurant.priceRange === 'luxury') return false;
                if (preferences.budgetType === 'luxury' && restaurant.priceRange === 'budget') return false;
                return true;
            })
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 6);
    }

    static getAttractionRecommendations(destination, preferences, travelers) {
        const attractionDatabase = {
            "Paris": [
                {
                    id: 5,
                    name: "Musée de l'Orangerie",
                    type: "attraction",
                    category: "museum",
                    description: "Intimate museum housing Monet's Water Lilies and impressionist masterpieces",
                    rating: 4.6,
                    coordinates: [2.3226, 48.8637],
                    address: "Jardin Tuileries, 75001 Paris",
                    tags: ["Art", "Impressionism", "Less Crowded"],
                    openHours: "9:00 AM - 6:00 PM",
                    estimatedDuration: 90,
                    estimatedCost: { budget: 12, midRange: 12, luxury: 12 },
                    matchScore: 0.89,
                    reasons: ["Perfect for art lovers", "Less touristy", "Manageable size"],
                    bestTimeToVisit: "Early morning or late afternoon"
                },
                {
                    id: 6,
                    name: "Sainte-Chapelle",
                    type: "attraction",
                    category: "historical",
                    description: "Gothic chapel famous for its stunning stained glass windows",
                    rating: 4.7,
                    coordinates: [2.3451, 48.8555],
                    address: "10 Boulevard du Palais, 75001 Paris",
                    tags: ["Gothic Architecture", "Stained Glass", "Historical"],
                    openHours: "9:00 AM - 7:00 PM",
                    estimatedDuration: 45,
                    estimatedCost: { budget: 11, midRange: 11, luxury: 11 },
                    matchScore: 0.85,
                    reasons: ["Architectural marvel", "Quick visit", "Instagram worthy"],
                    bestTimeToVisit: "Late afternoon for best light"
                }
            ]
        };

        const cityAttractions = attractionDatabase[destination.city] || attractionDatabase["Paris"];
        
        return cityAttractions
            .filter(attraction => {
                // Filter based on interests
                if (preferences.interests.includes('art') && attraction.category === 'museum') return true;
                if (preferences.interests.includes('history') && attraction.category === 'historical') return true;
                return preferences.interests.includes('culture');
            })
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 8);
    }

    static getEventRecommendations(destination, dates, preferences) {
        // Generate events based on travel dates
        const eventDatabase = {
            "Paris": [
                {
                    id: 7,
                    name: "Seine River Evening Cruise",
                    type: "event",
                    category: "experience",
                    description: "Romantic evening cruise along the Seine with dinner and city views",
                    rating: 4.4,
                    coordinates: [2.3522, 48.8566],
                    schedule: "Daily 7:00 PM - 10:00 PM",
                    estimatedCost: { budget: 45, midRange: 75, luxury: 120 },
                    tags: ["Romantic", "Evening", "Sightseeing"],
                    matchScore: 0.82,
                    reasons: ["Perfect for couples", "Great city views", "Memorable experience"]
                },
                {
                    id: 8,
                    name: "Cooking Class in Montmartre",
                    type: "event",
                    category: "culinary",
                    description: "Learn to cook traditional French dishes with a local chef",
                    rating: 4.8,
                    coordinates: [2.3412, 48.8867],
                    schedule: "Tuesdays & Saturdays 3:00 PM - 6:00 PM",
                    estimatedCost: { budget: 85, midRange: 95, luxury: 120 },
                    tags: ["Cooking", "Local Experience", "Interactive"],
                    matchScore: 0.78,
                    reasons: ["Hands-on experience", "Learn local cuisine", "Meet other travelers"]
                }
            ]
        };

        const cityEvents = eventDatabase[destination.city] || eventDatabase["Paris"];
        return cityEvents.slice(0, 4);
    }

    static getHiddenGemRecommendations(destination, preferences) {
        const hiddenGemDatabase = {
            "Paris": [
                {
                    id: 9,
                    name: "Promenade Plantée",
                    type: "hidden_gem",
                    category: "nature",
                    description: "Elevated park built on former railway line, peaceful escape from city crowds",
                    rating: 4.3,
                    coordinates: [2.3713, 48.8485],
                    address: "Coulée verte René-Dumont, 75012 Paris",
                    tags: ["Nature", "Peaceful", "Unique", "Free"],
                    estimatedCost: { budget: 0, midRange: 0, luxury: 0 },
                    matchScore: 0.87,
                    reasons: ["Free activity", "Unique perspective", "Less crowded"],
                    localTip: "Start at Bastille and walk towards Vincennes"
                },
                {
                    id: 10,
                    name: "Marché des Enfants Rouges",
                    type: "hidden_gem",
                    category: "food_market",
                    description: "Paris' oldest covered market with diverse international food stalls",
                    rating: 4.5,
                    coordinates: [2.3647, 48.8630],
                    address: "39 Rue de Bretagne, 75003 Paris",
                    tags: ["Local Market", "Food", "Authentic", "Diverse Cuisine"],
                    estimatedCost: { budget: 15, midRange: 20, luxury: 25 },
                    matchScore: 0.83,
                    reasons: ["Authentic local experience", "Great for food lovers", "Cultural immersion"],
                    localTip: "Visit during lunch hours for the best selection"
                }
            ]
        };

        const cityGems = hiddenGemDatabase[destination.city] || hiddenGemDatabase["Paris"];
        return cityGems.slice(0, 5);
    }

    static getShoppingRecommendations(destination, preferences, travelers) {
        const shoppingDatabase = {
            "Paris": [
                {
                    id: 11,
                    name: "Marché aux Puces de Saint-Ouen",
                    type: "shopping",
                    category: "flea_market",
                    description: "World's largest antique market with vintage treasures and unique finds",
                    rating: 4.2,
                    coordinates: [2.3421, 48.9014],
                    address: "Rue des Rosiers, 93400 Saint-Ouen",
                    tags: ["Antiques", "Vintage", "Unique Finds", "Weekend Market"],
                    openHours: "Saturday - Monday 9:00 AM - 6:00 PM",
                    estimatedCost: { budget: 20, midRange: 50, luxury: 200 },
                    matchScore: 0.76,
                    reasons: ["Unique souvenirs", "Vintage finds", "Cultural experience"]
                }
            ]
        };

        const cityShopping = shoppingDatabase[destination.city] || shoppingDatabase["Paris"];
        return cityShopping.slice(0, 4);
    }
}

export { AIItineraryService, SmartRecommendationService };
