import express from 'express';
import {
  createItinerary,
  getItineraries,
  getItinerary,
  updateItinerary,
  deleteItinerary,
  rateItinerary
} from '../controllers/itineraryController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { itinerarySchema, ratingSchema } from '../validators/itineraryValidator.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create itinerary
router.post('/', validateRequest(itinerarySchema), createItinerary);

// Get all itineraries for current user
router.get('/', getItineraries);

// Get specific itinerary
router.get('/:id', getItinerary);

// Update itinerary
router.put('/:id', validateRequest(itinerarySchema), updateItinerary);

// Delete itinerary
router.delete('/:id', deleteItinerary);

// Rate itinerary
router.post('/:id/rate', validateRequest(ratingSchema), rateItinerary);

export default router;