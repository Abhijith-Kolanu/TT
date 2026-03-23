import express from 'express';
import { upsertGuideProfile, getGuides, getGuideProfile, getMyGuideProfile } from '../controllers/guide.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
const router = express.Router();


// Create or update guide profile
router.post('/profile', isAuthenticated, upsertGuideProfile);

// Get current user's guide profile
router.get('/me', isAuthenticated, getMyGuideProfile);

// Get all guides (with search/filter)
router.get('/', getGuides);

// Get a single guide profile
router.get('/:id', getGuideProfile);

export default router;
