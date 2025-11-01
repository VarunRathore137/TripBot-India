import { body } from 'express-validator';
import { handleValidation } from './validationHandler.js';

export const validateItineraryInput = [
    body('groupType')
        .isIn(['Solo', 'Couple', 'Family', 'Friends', 'Business'])
        .withMessage('Invalid group type'),
        
    body('numDays')
        .isInt({ min: 1, max: 30 })
        .withMessage('Number of days must be between 1 and 30'),
        
    body('budget')
        .isIn(['budget', 'moderate', 'luxury'])
        .withMessage('Invalid budget category'),
        
    body('numPeople')
        .isInt({ min: 1 })
        .withMessage('Number of people must be at least 1'),
        
    // Optional destination
    body('destination')
        .optional()
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Destination must be a non-empty string if provided'),
        
    handleValidation
];