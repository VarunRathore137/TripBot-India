import { Router } from 'express';
import { ModelInterface } from '../../API/ml/model_interface.js';
import { TravelPreferences } from '../../API/openAIAPI.js';
import { auth } from '../middleware/security.js';
import { validateItineraryInput } from '../validators/itineraryValidator.js';

const router = Router();

// Initialize SLM model interface
const modelInterface = new ModelInterface(
    'API/ml/checkpoints/best_model.pt',
    'API/ml/checkpoints/tokenizer'
);

// Generate itinerary using SLM
router.post('/generate', auth, validateItineraryInput, async (req, res, next) => {
    try {
        const { destination, groupType, numDays, budget, numPeople } = req.body;

        // Create travel preferences object
        const preferences = new TravelPreferences(
            destination,
            groupType,
            numDays,
            budget,
            numPeople
        );

        // Generate itinerary with fallback to API if needed
        const itinerary = await modelInterface.generate_itinerary(preferences, true);

        res.json({
            status: 'success',
            data: {
                itinerary
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get model performance metrics
router.get('/metrics', auth, async (req, res) => {
    const metrics = modelInterface.get_performance_metrics();
    res.json({
        status: 'success',
        data: {
            metrics
        }
    });
});

export default router;