import jwt from 'jsonwebtoken';
import config from '../config/app.js';

/**
 * Generate a test JWT token
 * @param {Object} user - User object to encode in token
 * @returns {String} JWT token
 */
export const generateTestToken = (user = {
  _id: 'test123',
  email: 'test@example.com',
  name: 'Test User'
}) => {
  return jwt.sign(user, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

/**
 * Mock response object for testing
 */
export class MockResponse {
  constructor() {
    this.statusCode = 200;
    this.data = null;
    this.headers = {};
  }

  status(code) {
    this.statusCode = code;
    return this;
  }

  json(data) {
    this.data = data;
    return this;
  }

  setHeader(key, value) {
    this.headers[key] = value;
    return this;
  }
}

/**
 * Mock request object for testing
 */
export class MockRequest {
  constructor(options = {}) {
    this.body = options.body || {};
    this.query = options.query || {};
    this.params = options.params || {};
    this.headers = options.headers || {};
    this.user = options.user || null;
  }
}

/**
 * Create test data for itinerary
 */
export const createTestItinerary = () => ({
  title: 'Test Trip to Agra',
  destination: {
    name: 'Agra',
    country: 'India',
    coordinates: {
      latitude: 27.1767,
      longitude: 78.0081
    }
  },
  startDate: new Date('2024-03-01'),
  endDate: new Date('2024-03-03'),
  days: [
    {
      date: new Date('2024-03-01'),
      activities: [
        {
          name: 'Visit Taj Mahal',
          description: 'Early morning visit to the Taj Mahal',
          location: {
            name: 'Taj Mahal',
            coordinates: {
              latitude: 27.1751,
              longitude: 78.0421
            }
          },
          startTime: new Date('2024-03-01T06:00:00'),
          endTime: new Date('2024-03-01T10:00:00'),
          category: 'sightseeing',
          cost: {
            amount: 1100,
            currency: 'INR'
          }
        }
      ]
    }
  ],
  budget: {
    amount: 15000,
    currency: 'INR'
  },
  preferences: {
    travelStyle: 'cultural',
    accommodation: 'hotel',
    transportation: 'car'
  }
});