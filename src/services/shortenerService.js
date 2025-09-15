const { ShortenedUrl } = require('../models');

const generateShortCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const shortenUrl = async (originalUrl, userId = null) => {
  // Verificar se a URL já foi encurtada pelo usuário
  if (userId) {
    const existingUrl = await ShortenedUrl.findOne({
      where: { original_url: originalUrl, user_id: userId, deleted_at: null }
    });
    
    if (existingUrl) {
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      return {
        original_url: existingUrl.original_url,
        short_url: `${baseUrl}/${existingUrl.short_code}`,
        short_code: existingUrl.short_code
      };
    }
  }

  // Gerar código curto único
  let shortCode;
  let isUnique = false;
  
  while (!isUnique) {
    shortCode = generateShortCode();
    const existing = await ShortenedUrl.findOne({ where: { short_code: shortCode } });
    if (!existing) {
      isUnique = true;
    }
  }

  // Criar a URL encurtada
  const shortenedUrl = await ShortenedUrl.create({
    original_url: originalUrl,
    short_code: shortCode,
    user_id: userId
  });

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  return {
    original_url: shortenedUrl.original_url,
    short_url: `${baseUrl}/${shortenedUrl.short_code}`,
    short_code: shortenedUrl.short_code
  };
};

module.exports = {
  shortenUrl,
  generateShortCode
};