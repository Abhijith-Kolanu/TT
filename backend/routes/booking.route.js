import express from 'express';
import { createBooking, getBookings, updateBookingStatus, getBookingStatus } from '../controllers/booking.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
const router = express.Router();

// Create a new booking
router.post('/', isAuthenticated, createBooking);
// Get all bookings for current user
router.get('/', isAuthenticated, getBookings);
// Update booking status (accept/reject/cancel)
router.put('/:bookingId', isAuthenticated, updateBookingStatus);
// Get booking status between traveller and guide
router.get('/status/:guideId', isAuthenticated, getBookingStatus);

export default router;
