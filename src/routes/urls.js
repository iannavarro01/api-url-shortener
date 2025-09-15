const express = require('express');
const router = express.Router();

// Placeholder para rotas de URLs
router.post('/shorten', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

router.get('/', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

router.put('/:id', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

router.delete('/:id', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

module.exports = router;