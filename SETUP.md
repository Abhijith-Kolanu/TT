# AI Trip Planner with Gemini API Setup

## Prerequisites

1. **Google Gemini API Key**: Get your API key from [Google AI Studio](https://aistudio.google.com/)

## Backend Setup

1. **Install Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file in the backend directory with:
   ```env
   # Database
   MONGO_URI=mongodb://localhost:27017/trektales

   # JWT
   JWT_SECRET=your_jwt_secret_key_here

   # Google Gemini AI API
   GEMINI_API_KEY=your_gemini_api_key_here

   # Server
   PORT=8000
   NODE_ENV=development
   ```

3. **Start the Backend**:
   ```bash
   npm start
   ```

## Frontend Setup

1. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start the Frontend**:
   ```bash
   npm run dev
   ```

## Features Implemented

### ✅ Feature 1: Personalized Itinerary Generation
- AI-powered day-by-day itinerary creation using Gemini API
- Considers user preferences, budget type, and travel style
- Detailed activities with time, location, and cost estimates

### ✅ Feature 2: Smart Recommendations
- Personalized restaurant, attraction, and event suggestions
- Filtered by user interests and budget preferences
- Categorized recommendations with ratings and descriptions

### ✅ Feature 3: Enhanced Budget & Cost Estimation
- Detailed cost breakdown by category (accommodation, food, activities, transport)
- Multiple budget tiers (budget, mid-range, luxury)
- Real-time cost calculations integrated with itinerary

### ✅ Feature 4: Real-time Data Integration
- Current weather conditions and forecasts
- Traffic and transportation updates
- Local events and safety alerts
- Updated destination information

### ✅ Feature 5: Interactive Map & Route Optimization
- Day-wise route optimization for minimal travel time
- Interactive route planning with waypoints
- Travel time and distance calculations
- Transportation mode considerations

## API Endpoints

### Trip Management
- `POST /api/v1/trip/create` - Create new trip
- `GET /api/v1/trip/my-trips` - Get user trips
- `GET /api/v1/trip/:tripId` - Get trip details
- `PUT /api/v1/trip/:tripId` - Update trip
- `DELETE /api/v1/trip/:tripId` - Delete trip

### AI Features
- `POST /api/v1/trip/:tripId/generate` - Generate AI itinerary
- `GET /api/v1/trip/:tripId/recommendations` - Get smart recommendations
- `GET /api/v1/trip/:tripId/realtime` - Get real-time information
- `POST /api/v1/trip/:tripId/optimize-route` - Optimize route for selected day

## Usage

1. **Create a Trip**: Use the trip planner to create a new trip with destination, dates, and preferences
2. **Generate Itinerary**: Click "Generate AI Itinerary" to create a detailed day-by-day plan
3. **Explore Recommendations**: Visit the "Smart Recommendations" tab for personalized suggestions
4. **Check Real-time Info**: Get current weather, traffic, and local updates
5. **Optimize Routes**: Use route optimization to plan efficient daily travel paths

## Note

- Ensure you have a valid Gemini API key for AI features to work
- The app requires an active internet connection for AI-powered features
- MongoDB should be running for data persistence
