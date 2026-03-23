import express from 'express';
import {
    createVehicle,
    getAllVehicles,
    getVehicleById,
    getMyVehicles,
    updateVehicle,
    deleteVehicle,
    createRental,
    getMyRentals,
    updateRentalStatus,
} from '../controllers/vehicle.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

// ─── Vehicle listings ─────────────────────────────────────────────────────────
router.get('/', isAuthenticated, getAllVehicles);                          // browse all
router.get('/my', isAuthenticated, getMyVehicles);                        // owner's listings
router.post('/', isAuthenticated, upload.array('images', 5), createVehicle);  // add listing
router.put('/:id', isAuthenticated, updateVehicle);                       // edit listing
router.delete('/:id', isAuthenticated, deleteVehicle);                    // remove listing

// ─── Rentals (must be before /:id to avoid route conflict) ───────────────────
router.post('/rental/book', isAuthenticated, createRental);               // book a vehicle
router.get('/rental/mine', isAuthenticated, getMyRentals);                // my rentals
router.put('/rental/:rentalId', isAuthenticated, updateRentalStatus);     // confirm/cancel

// ─── Single vehicle (parameterized – must be last) ────────────────────────────
router.get('/:id', isAuthenticated, getVehicleById);                      // single vehicle

export default router;
