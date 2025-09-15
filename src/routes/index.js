const express = require('express');
const authRoutes = require('./auth');
const urlRoutes = require('./urls');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     HealthCheck:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: OK
 *         timestamp:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health Check
 *     description: Verifica se a API está funcionando corretamente
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API está funcionando
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 *             example:
 *               status: OK
 *               timestamp: 2024-01-01T12:00:00.000Z
 */
// Rotas públicas (sem autenticação)
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/urls', urlRoutes);

module.exports = router;


/**
 * @swagger
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Mensagem de erro
 *         details:
 *           type: array
 *           items:
 *             type: object
 *           description: Detalhes dos erros de validação (opcional)
 */