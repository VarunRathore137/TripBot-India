import Joi from 'joi';

export const itinerarySchema = Joi.object({
  title: Joi.string()
    .required()
    .min(3)
    .max(100)
    .trim()
    .messages({
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title cannot exceed 100 characters'
    }),

  description: Joi.string()
    .required()
    .min(10)
    .max(1000)
    .trim()
    .messages({
      'string.empty': 'Description is required',
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description cannot exceed 1000 characters'
    }),

  startDate: Joi.date()
    .required()
    .min('now')
    .messages({
      'date.base': 'Start date must be a valid date',
      'date.min': 'Start date cannot be in the past'
    }),

  endDate: Joi.date()
    .required()
    .min(Joi.ref('startDate'))
    .messages({
      'date.base': 'End date must be a valid date',
      'date.min': 'End date must be after start date'
    }),

  destinations: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required().trim(),
        coordinates: Joi.object({
          latitude: Joi.number().required().min(-90).max(90),
          longitude: Joi.number().required().min(-180).max(180)
        }).required(),
        stayDuration: Joi.number().required().min(1),
        activities: Joi.array().items(Joi.string().trim())
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one destination is required',
      'array.base': 'Destinations must be an array'
    }),

  budget: Joi.object({
    amount: Joi.number().required().min(0),
    currency: Joi.string().required().length(3).uppercase()
  }).required(),

  travelMode: Joi.string()
    .required()
    .valid('DRIVING', 'TRANSIT', 'WALKING', 'BICYCLING', 'MIXED')
    .messages({
      'any.only': 'Invalid travel mode selected'
    }),

  preferences: Joi.object({
    accommodation: Joi.string().valid('BUDGET', 'MODERATE', 'LUXURY').required(),
    foodPreference: Joi.string().valid('VEG', 'NON_VEG', 'VEGAN').required(),
    activityLevel: Joi.string().valid('LOW', 'MODERATE', 'HIGH').required()
  }).required(),

  tags: Joi.array()
    .items(Joi.string().trim())
    .min(1)
    .max(10)
    .messages({
      'array.min': 'At least one tag is required',
      'array.max': 'Cannot have more than 10 tags'
    })
});

export const ratingSchema = Joi.object({
  score: Joi.number()
    .required()
    .min(1)
    .max(5)
    .messages({
      'number.base': 'Score must be a number',
      'number.min': 'Score must be at least 1',
      'number.max': 'Score cannot exceed 5'
    }),

  comment: Joi.string()
    .required()
    .min(10)
    .max(500)
    .trim()
    .messages({
      'string.empty': 'Comment is required',
      'string.min': 'Comment must be at least 10 characters long',
      'string.max': 'Comment cannot exceed 500 characters'
    })
});