const request = require('supertest');
const app = require('../../src/app');
const { ShortenedUrl, UrlAccess } = require('../../src/models');
const jwt = require('jsonwebtoken');

jest.mock('../../src/models');
jest.mock('jsonwebtoken');

describe('URLs API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/urls/shorten', () => {
    test('should shorten URL successfully for authenticated user', async () => {
      const urlData = {
        original_url: 'https://example.com/very/long/url'
      };

      const mockUser = { userId: 1 };
      const mockShortenedUrl = {
        original_url: urlData.original_url,
        short_code: 'abc123',
        user_id: mockUser.userId
      };

      jwt.verify.mockReturnValue(mockUser);
      ShortenedUrl.findOne.mockResolvedValue(null);
      ShortenedUrl.create.mockResolvedValue(mockShortenedUrl);

      const response = await request(app)
        .post('/api/urls/shorten')
        .set('Authorization', 'Bearer mockToken')
        .send(urlData)
        .expect(200);

      expect(response.body.message).toBe('URL shortened successfully');
      expect(response.body.data.original_url).toBe(urlData.original_url);
    });

    test('should shorten URL successfully for anonymous user', async () => {
      const urlData = {
        original_url: 'https://example.com/very/long/url'
      };

      const mockShortenedUrl = {
        original_url: urlData.original_url,
        short_code: 'abc123',
        user_id: null
      };

      ShortenedUrl.findOne.mockResolvedValue(null);
      ShortenedUrl.create.mockResolvedValue(mockShortenedUrl);

      const response = await request(app)
        .post('/api/urls/shorten')
        .send(urlData)
        .expect(200);

      expect(response.body.message).toBe('URL shortened successfully');
    });
  });

  describe('GET /api/urls', () => {
    test('should return user URLs', async () => {
      const mockUser = { userId: 1 };
      const mockUrls = [
        {
          id: 1,
          original_url: 'https://example.com',
          short_code: 'abc123',
          click_count: 5,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      jwt.verify.mockReturnValue(mockUser);
      ShortenedUrl.findAll.mockResolvedValue(mockUrls);

      const response = await request(app)
        .get('/api/urls')
        .set('Authorization', 'Bearer mockToken')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0].short_code).toBe('abc123');
    });
  });
});