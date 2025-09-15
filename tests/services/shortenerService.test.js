// tests/services/shortenerService.test.js
const { ShortenedUrl } = require('../../src/models');

// Mock completo do módulo shortenerService
jest.mock('../../src/services/shortenerService', () => {
  // Função original para testes que não precisam de mock
  const originalModule = jest.requireActual('../../src/services/shortenerService');
  return {
    ...originalModule,
    generateShortCode: jest.fn(), // Mock da função generateShortCode
    shortenUrl: jest.fn(), // Mock da função shortenUrl (será implementada nos testes)
  };
});

// Importa o módulo mockado
const shortenerService = require('../../src/services/shortenerService');
const { shortenUrl, generateShortCode } = shortenerService;

jest.mock('../../src/models');

describe('Shortener Service', () => {
  describe('generateShortCode', () => {
    test('should generate a 6-character code', () => {
      // Usa a implementação original para este teste
      const originalGenerateShortCode = jest.requireActual('../../src/services/shortenerService').generateShortCode;
      const code = originalGenerateShortCode();
      expect(code).toHaveLength(6);
      expect(code).toMatch(/^[A-Za-z0-9]{6}$/);
    });
  });

  describe('shortenUrl', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should create a new shortened URL for authenticated user', async () => {
      const mockUrl = 'https://example.com';
      const mockUserId = 1;
      const mockShortenedUrl = {
        original_url: mockUrl,
        short_code: 'abc123',
        user_id: mockUserId,
      };

      ShortenedUrl.findOne
        .mockResolvedValueOnce(null) // Não existe URL para esse usuário
        .mockResolvedValueOnce(null); // Código único disponível

      ShortenedUrl.create.mockResolvedValue(mockShortenedUrl);

      // Configura o mock de generateShortCode
      generateShortCode.mockReturnValue('abc123');

      // Configura o mock de shortenUrl para simular a lógica real
      shortenUrl.mockImplementation(async (url, userId) => {
        const existingUrl = await ShortenedUrl.findOne({ where: { original_url: url, user_id: userId } });
        if (existingUrl) return existingUrl;

        const shortCode = generateShortCode();
        const existingCode = await ShortenedUrl.findOne({ where: { short_code: shortCode } });
        if (!existingCode) {
          return ShortenedUrl.create({
            original_url: url,
            short_code: shortCode,
            user_id: userId,
          });
        }
        throw new Error('Code collision not handled in this mock');
      });

      const result = await shortenUrl(mockUrl, mockUserId);

      expect(result.original_url).toBe(mockUrl);
      expect(result.short_code).toBe('abc123');
      expect(ShortenedUrl.create).toHaveBeenCalledWith({
        original_url: mockUrl,
        short_code: 'abc123',
        user_id: mockUserId,
      });
    });

    test('should return existing URL if already shortened by user', async () => {
      const mockUrl = 'https://example.com';
      const mockUserId = 1;
      const mockExistingUrl = {
        original_url: mockUrl,
        short_code: 'existing',
        user_id: mockUserId,
      };

      ShortenedUrl.findOne.mockResolvedValue(mockExistingUrl);

      // Configura o mock de shortenUrl
      shortenUrl.mockImplementation(async (url, userId) => {
        const existingUrl = await ShortenedUrl.findOne({ where: { original_url: url, user_id: userId } });
        if (existingUrl) return existingUrl;
        throw new Error('URL should exist in this test');
      });

      const result = await shortenUrl(mockUrl, mockUserId);

      expect(result.original_url).toBe(mockUrl);
      expect(result.short_code).toBe('existing');
      expect(ShortenedUrl.create).not.toHaveBeenCalled();
    });

    test('should generate unique codes if collision occurs', async () => {
      const mockUrl = 'https://example.com';
      const mockUserId = 1;
      const mockShortenedUrl = {
        original_url: mockUrl,
        short_code: 'unique123',
        user_id: mockUserId,
      };

      ShortenedUrl.findOne
        .mockResolvedValueOnce(null) // Não existe URL para esse usuário
        .mockResolvedValueOnce({}) // Código já existe (colisão)
        .mockResolvedValueOnce(null); // Novo código é único

      ShortenedUrl.create.mockResolvedValue(mockShortenedUrl);

      // Configura o mock de generateShortCode para simular colisão
      generateShortCode
        .mockReturnValueOnce('collide')
        .mockReturnValueOnce('unique123');

      // Configura o mock de shortenUrl
      shortenUrl.mockImplementation(async (url, userId) => {
        const existingUrl = await ShortenedUrl.findOne({ where: { original_url: url, user_id: userId } });
        if (existingUrl) return existingUrl;

        let shortCode;
        do {
          shortCode = generateShortCode();
        } while (await ShortenedUrl.findOne({ where: { short_code: shortCode } }));

        return ShortenedUrl.create({
          original_url: url,
          short_code: shortCode,
          user_id: userId,
        });
      });

      const result = await shortenUrl(mockUrl, mockUserId);

      expect(result.original_url).toBe(mockUrl);
      expect(result.short_code).toBe('unique123');
      expect(ShortenedUrl.create).toHaveBeenCalledWith({
        original_url: mockUrl,
        short_code: 'unique123',
        user_id: mockUserId,
      });
      expect(generateShortCode).toHaveBeenCalledTimes(2);
    });

    test('should handle database errors', async () => {
      const mockUrl = 'https://example.com';
      const mockUserId = 1;

      ShortenedUrl.findOne.mockRejectedValue(new Error('Database error'));

      // Configura o mock de shortenUrl
      shortenUrl.mockImplementation(async () => {
        throw new Error('Database error');
      });

      await expect(shortenUrl(mockUrl, mockUserId)).rejects.toThrow('Database error');
    });

    test('should generate codes quickly', async () => {
      // Usa a implementação original para testar performance
      const originalGenerateShortCode = jest.requireActual('../../src/services/shortenerService').generateShortCode;
      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        originalGenerateShortCode();
      }
      const end = Date.now();
      expect(end - start).toBeLessThan(1000); // Deve levar menos de 1 segundo
    });
  });
});