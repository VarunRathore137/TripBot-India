import express from 'express';
import {
  createItinerary,
  getItineraries,
  getItinerary,
  updateItinerary,
  deleteItinerary,
  rateItinerary
} from '../controllers/itineraryController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, createItinerary);
router.get('/', auth, getItineraries);
router.get('/:id', auth, getItinerary);
router.patch('/:id', auth, updateItinerary);
router.delete('/:id', auth, deleteItinerary);
router.post('/:id/rate', auth, rateItinerary);

export default router;