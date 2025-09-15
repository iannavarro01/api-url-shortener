const express = require('express');
const { ShortenedUrl, UrlAccess } = require('../models');
const { shortenUrl } = require('../services/shortenerService');
const auth = require('../middleware/auth');
const router = express.Router();

// Encurtar URL (público e autenticado)
router.post('/shorten', auth.optional, async (req, res) => {
  try {
    const { original_url } = req.body;
    const userId = req.user ? req.user.userId : null;

    if (!original_url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const result = await shortenUrl(original_url, userId);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Redirecionar e contabilizar acesso
router.get('/:short_code', async (req, res) => {
  try {
    const { short_code } = req.params;

    const shortenedUrl = await ShortenedUrl.findOne({
      where: { short_code, deleted_at: null }
    });

    if (!shortenedUrl) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Contabilizar acesso
    await UrlAccess.create({
      shortened_url_id: shortenedUrl.id,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    // Incrementar contador de cliques
    shortenedUrl.click_count += 1;
    await shortenedUrl.save();

    // Redirecionar
    res.redirect(shortenedUrl.original_url);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Listar URLs do usuário (autenticado)
router.get('/', auth.required, async (req, res) => {
  try {
    const userId = req.user.userId;
    const urls = await ShortenedUrl.findAll({
      where: { user_id: userId, deleted_at: null },
      attributes: ['id', 'original_url', 'short_code', 'click_count', 'created_at', 'updated_at']
    });

    res.json(urls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Atualizar URL (autenticado)
router.put('/:id', auth.required, async (req, res) => {
  try {
    const { id } = req.params;
    const { original_url } = req.body;
    const userId = req.user.userId;

    const shortenedUrl = await ShortenedUrl.findOne({
      where: { id, user_id: userId, deleted_at: null }
    });

    if (!shortenedUrl) {
      return res.status(404).json({ error: 'URL not found' });
    }

    shortenedUrl.original_url = original_url;
    await shortenedUrl.save();

    res.json(shortenedUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Deletar URL (soft delete, autenticado)
router.delete('/:id', auth.required, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const shortenedUrl = await ShortenedUrl.findOne({
      where: { id, user_id: userId, deleted_at: null }
    });

    if (!shortenedUrl) {
      return res.status(404).json({ error: 'URL not found' });
    }

    shortenedUrl.deleted_at = new Date();
    await shortenedUrl.save();

    res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;