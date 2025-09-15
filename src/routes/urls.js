const express = require('express');
const { body } = require('express-validator');
const { ShortenedUrl, UrlAccess } = require('../models');
const { shortenUrl } = require('../services/shortenerService');
const auth = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const router = express.Router();

// Validação para encurtamento de URL
const validateShortenUrl = [
  body('original_url')
    .isURL()
    .withMessage('Must be a valid URL'),
  handleValidationErrors
];

// Validação para atualização de URL
const validateUpdateUrl = [
  body('original_url')
    .isURL()
    .withMessage('Must be a valid URL'),
  handleValidationErrors
];

/**
 * @swagger
 * components:
 *   schemas:
 *     ShortenedUrl:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID da URL encurtada
 *         original_url:
 *           type: string
 *           description: URL original
 *         short_code:
 *           type: string
 *           description: Código curto (6 caracteres)
 *         short_url:
 *           type: string
 *           description: URL encurtada completa
 *         click_count:
 *           type: integer
 *           description: Número de cliques
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data de última atualização
 *     ShortenUrlRequest:
 *       type: object
 *       required:
 *         - original_url
 *       properties:
 *         original_url:
 *           type: string
 *           description: URL original para encurtar
 *     ShortenUrlResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/ShortenedUrl'
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
 *           description: Detalhes dos erros de validação
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/urls/shorten:
 *   post:
 *     summary: Encurta uma URL
 *     description: Endpoint para encurtar URLs. Funciona tanto para usuários autenticados quanto não autenticados.
 *     tags: [URLs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShortenUrlRequest'
 *     responses:
 *       200:
 *         description: URL encurtada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShortenUrlResponse'
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/shorten', auth.optional, validateShortenUrl, async (req, res) => {
  try {
    const { original_url } = req.body;
    const userId = req.user ? req.user.userId : null;

    const result = await shortenUrl(original_url, userId);
    res.json({
      message: 'URL shortened successfully',
      data: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /{short_code}:
 *   get:
 *     summary: Redireciona para a URL original
 *     description: Redireciona o usuário para a URL original e contabiliza o acesso.
 *     tags: [URLs]
 *     parameters:
 *       - in: path
 *         name: short_code
 *         required: true
 *         schema:
 *           type: string
 *         description: Código curto da URL
 *     responses:
 *       302:
 *         description: Redirecionamento para a URL original
 *       404:
 *         description: URL não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 */
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

/**
 * @swagger
 * /api/urls:
 *   get:
 *     summary: Lista URLs do usuário
 *     description: Retorna todas as URLs encurtadas pelo usuário autenticado.
 *     tags: [URLs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de URLs do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ShortenedUrl'
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 */
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

/**
 * @swagger
 * /api/urls/{id}:
 *   put:
 *     summary: Atualiza uma URL
 *     description: Atualiza a URL original de uma URL encurtada.
 *     tags: [URLs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da URL encurtada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShortenUrlRequest'
 *     responses:
 *       200:
 *         description: URL atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShortenedUrl'
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: URL não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id', auth.required, validateUpdateUrl, async (req, res) => {
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

/**
 * @swagger
 * /api/urls/{id}:
 *   delete:
 *     summary: Exclui uma URL
 *     description: Exclui logicamente uma URL encurtada (soft delete).
 *     tags: [URLs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da URL encurtada
 *     responses:
 *       200:
 *         description: URL excluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: URL não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 */
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