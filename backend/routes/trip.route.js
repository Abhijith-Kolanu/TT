import express from "express";
import { 
    createTrip, 
    generateItinerary, 
    getSmartRecommendations,
    getUserTrips, 
    getTripById, 
    updateTrip, 
    deleteTrip,
    getRealTimeInfo,
    optimizeRoute
} from "../controllers/trip.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Protected routes (require authentication)
router.post("/create", isAuthenticated, createTrip);
router.post("/:tripId/generate", isAuthenticated, generateItinerary);
router.get("/:tripId/recommendations", isAuthenticated, getSmartRecommendations);
router.get("/:tripId/realtime", isAuthenticated, getRealTimeInfo);
router.post("/:tripId/optimize-route", isAuthenticated, optimizeRoute);
router.get("/my-trips", isAuthenticated, getUserTrips);
router.get("/:tripId", isAuthenticated, getTripById);
router.put("/:tripId", isAuthenticated, updateTrip);
router.delete("/:tripId", isAuthenticated, deleteTrip);

export default router;
