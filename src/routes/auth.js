const express = require('express');
const router = express.Router();

// Placeholder para rotas de autenticação
router.post('/register', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

router.post('/login', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

module.exports = router;