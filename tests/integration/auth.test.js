const request = require('supertest');
const app = require('../../src/app');
const { User } = require('../../src/models');
const jwt = require('jsonwebtoken');

jest.mock('../../src/models');
jest.mock('jsonwebtoken');

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 1,
        email: userData.email
      });
      jwt.sign.mockReturnValue('mockToken');

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('User created successfully');
      expect(response.body.token).toBe('mockToken');
      expect(response.body.user.email).toBe(userData.email);
    });

    test('should return error if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123'
      };

      User.findOne.mockResolvedValue({ id: 1, email: userData.email });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 1,
        email: userData.email,
        password: 'hashedPassword',
        validPassword: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mockToken');

      const response = await request(app)
        .post('/api/auth/login')
        .send(userData)
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBe('mockToken');
    });

    test('should return error for invalid credentials', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(userData)
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });
  });
});