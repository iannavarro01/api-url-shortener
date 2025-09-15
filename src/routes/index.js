const express = require('express');
const router = express.Router();

// Rotas públicas (sem autenticação)
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rotas de autenticação (serão implementadas depois)
router.use('/auth', require('./auth'));

// Rotas de URLs (serão implementadas depois)
router.use('/urls', require('./urls'));

module.exports = router;