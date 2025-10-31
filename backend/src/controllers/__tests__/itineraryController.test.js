import {
  createItinerary,
  getItineraries,
  getItinerary,
  updateItinerary,
  deleteItinerary,
  rateItinerary
} from '../itineraryController.js';
import { MockRequest, MockResponse, createTestItinerary } from '../../utils/testUtils.js';

// Mock Itinerary model
jest.mock('../../models/itinerary.js', () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

describe('Itinerary Controller', () => {
  let req;
  let res;
  const mockUser = { _id: 'user123', name: 'Test User' };

  beforeEach(() => {
    req = new MockRequest({ user: mockUser });
    res = new MockResponse();
    jest.clearAllMocks();
  });

  describe('createItinerary', () => {
    it('should create a new itinerary', async () => {
      const itineraryData = createTestItinerary();
      req.body = itineraryData;

      const mockCreatedItinerary = {
        ...itineraryData,
        _id: 'itinerary123',
        user: mockUser._id
      };

      require('../../models/itinerary.js').create.mockResolvedValue(mockCreatedItinerary);

      await createItinerary(req, res);

      expect(res.statusCode).toBe(201);
      expect(res.data.success).toBe(true);
      expect(res.data.data.itinerary).toBeDefined();
    });
  });

  describe('getItineraries', () => {
    it('should return user itineraries', async () => {
      const mockItineraries = [
        { ...createTestItinerary(), _id: 'itinerary1' },
        { ...createTestItinerary(), _id: 'itinerary2' }
      ];

      require('../../models/itinerary.js').find.mockResolvedValue(mockItineraries);

      await getItineraries(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.itineraries).toHaveLength(2);
    });
  });

  describe('getItinerary', () => {
    it('should return a specific itinerary', async () => {
      const mockItinerary = {
        ...createTestItinerary(),
        _id: 'itinerary123',
        user: mockUser._id
      };

      req.params = { id: mockItinerary._id };
      require('../../models/itinerary.js').findById.mockResolvedValue(mockItinerary);

      await getItinerary(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.itinerary).toBeDefined();
    });
  });

  describe('updateItinerary', () => {
    it('should update an itinerary', async () => {
      const updates = {
        title: 'Updated Trip to Agra',
        budget: { amount: 20000, currency: 'INR' }
      };

      const mockItinerary = {
        ...createTestItinerary(),
        _id: 'itinerary123',
        user: mockUser._id,
        ...updates
      };

      req.params = { id: mockItinerary._id };
      req.body = updates;

      require('../../models/itinerary.js').findByIdAndUpdate.mockResolvedValue(mockItinerary);

      await updateItinerary(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.itinerary.title).toBe(updates.title);
    });
  });

  describe('deleteItinerary', () => {
    it('should delete an itinerary', async () => {
      const mockItinerary = {
        ...createTestItinerary(),
        _id: 'itinerary123',
        user: mockUser._id
      };

      req.params = { id: mockItinerary._id };
      require('../../models/itinerary.js').findByIdAndDelete.mockResolvedValue(mockItinerary);

      await deleteItinerary(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.message).toBe('Itinerary deleted successfully');
    });
  });

  describe('rateItinerary', () => {
    it('should add a rating to an itinerary', async () => {
      const rating = { score: 5, comment: 'Great itinerary!' };
      const mockItinerary = {
        ...createTestItinerary(),
        _id: 'itinerary123',
        user: 'otherUser123', // Different user than the rater
        ratings: []
      };

      req.params = { id: mockItinerary._id };
      req.body = rating;

      const updatedItinerary = {
        ...mockItinerary,
        ratings: [{
          user: mockUser._id,
          ...rating
        }]
      };

      require('../../models/itinerary.js').findByIdAndUpdate.mockResolvedValue(updatedItinerary);

      await rateItinerary(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.itinerary.ratings).toHaveLength(1);
    });
  });
});