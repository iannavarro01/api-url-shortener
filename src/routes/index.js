const express = require('express');
const authRoutes = require('./auth');
const urlRoutes = require('./urls');

const router = express.Router();

// Rotas públicas (sem autenticação)
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/urls', urlRoutes);

module.exports = router;