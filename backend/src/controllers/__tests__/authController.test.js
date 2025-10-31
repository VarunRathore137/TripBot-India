import { register, login, getProfile } from '../authController.js';
import { MockRequest, MockResponse } from '../../utils/testUtils.js';
import { apiResponse } from '../../utils/apiResponse.js';

// Mock User model
jest.mock('../../models/user.js', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

describe('Auth Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    req = new MockRequest();
    res = new MockResponse();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user and return token', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      req.body = userData;

      const mockUser = {
        ...userData,
        _id: 'test123',
        generateToken: () => 'mock_token'
      };

      // Mock User.create
      require('../../models/user.js').create.mockResolvedValue(mockUser);

      await register(req, res);

      expect(res.statusCode).toBe(201);
      expect(res.data).toEqual({
        success: true,
        message: 'User registered successfully',
        data: {
          token: 'mock_token',
          user: {
            id: mockUser._id,
            name: mockUser.name,
            email: mockUser.email
          }
        }
      });
    });
  });

  describe('login', () => {
    it('should authenticate user and return token', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      req.body = loginData;

      const mockUser = {
        _id: 'test123',
        email: loginData.email,
        name: 'Test User',
        comparePassword: () => true,
        generateToken: () => 'mock_token'
      };

      // Mock User.findOne
      require('../../models/user.js').findOne.mockResolvedValue(mockUser);

      await login(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data).toEqual({
        success: true,
        message: 'Login successful',
        data: {
          token: 'mock_token',
          user: {
            id: mockUser._id,
            name: mockUser.name,
            email: mockUser.email
          }
        }
      });
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockUser = {
        _id: 'test123',
        name: 'Test User',
        email: 'test@example.com'
      };

      req.user = mockUser;

      await getProfile(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data).toEqual({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          user: {
            id: mockUser._id,
            name: mockUser.name,
            email: mockUser.email
          }
        }
      });
    });
  });
});