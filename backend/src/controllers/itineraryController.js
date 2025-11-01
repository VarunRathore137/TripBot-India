import { Itinerary } from '../models/itinerary.js';
import ItineraryService from '../services/itineraryService.js';
import { validateItineraryInput } from '../validators/itineraryValidator.js';
import { apiResponse } from '../utils/apiResponse.js';

export const createItinerary = async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = validateItineraryInput(req.body);
    if (error) {
      return apiResponse.validationError(res, error.details.map(detail => detail.message));
    }

    // Generate itinerary using service
    const generatedItinerary = await ItineraryService.generateItinerary({
      ...value,
      user: req.user._id
    });

    // Save to database
    const itinerary = new Itinerary({
      ...generatedItinerary,
      user: req.user._id,
      status: 'active',
      createdAt: new Date()
    });

    await itinerary.save();

    // Send response
    return apiResponse.success(res, {
      message: 'Itinerary created successfully',
      data: { itinerary }
    }, 201);
    
  } catch (error) {
    if (error.message.includes('API key')) {
      return apiResponse.error(res, 'Service configuration error', 503);
    }
    if (error.message.includes('destination')) {
      return apiResponse.error(res, 'Invalid destination specified', 400);
    }
    if (error.message.includes('validation')) {
      return apiResponse.error(res, 'Invalid itinerary data', 400);
    }
    next(error);
  }
};

export const getItineraries = async (req, res, next) => {
  try {
    const match = { user: req.user._id };
    const sort = {};

    if (req.query.status) {
      match.status = req.query.status;
    }

    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    const itineraries = await Itinerary.find(match)
      .sort(sort)
      .limit(parseInt(req.query.limit))
      .skip(parseInt(req.query.skip));

    res.json({
      status: 'success',
      data: {
        itineraries
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!itinerary) {
      return res.status(404).json({
        status: 'error',
        message: 'Itinerary not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        itinerary
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateItinerary = async (req, res, next) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      'title',
      'destination',
      'startDate',
      'endDate',
      'days',
      'budget',
      'preferences',
      'status',
      'isPublic'
    ];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid updates'
      });
    }

    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!itinerary) {
      return res.status(404).json({
        status: 'error',
        message: 'Itinerary not found'
      });
    }

    updates.forEach(update => {
      itinerary[update] = req.body[update];
    });

    await itinerary.save();

    res.json({
      status: 'success',
      data: {
        itinerary
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!itinerary) {
      return res.status(404).json({
        status: 'error',
        message: 'Itinerary not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Itinerary deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const rateItinerary = async (req, res, next) => {
  try {
    const { rating, review } = req.body;
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({
        status: 'error',
        message: 'Itinerary not found'
      });
    }

    if (!itinerary.isPublic) {
      return res.status(403).json({
        status: 'error',
        message: 'Cannot rate private itineraries'
      });
    }

    // Check if user has already rated
    const existingRating = itinerary.ratings.find(
      r => r.user.toString() === req.user._id.toString()
    );

    if (existingRating) {
      existingRating.rating = rating;
      existingRating.review = review;
    } else {
      itinerary.ratings.push({
        user: req.user._id,
        rating,
        review
      });
    }

    await itinerary.save();

    res.json({
      status: 'success',
      data: {
        itinerary
      }
    });
  } catch (error) {
    next(error);
  }
};