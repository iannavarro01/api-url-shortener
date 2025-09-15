const express = require('express');
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { handleValidationErrors } = require('../middleware/validation');
const router = express.Router();

// Validações para registro
const validateRegistration = [
  body('email')
    .isEmail()
    .withMessage('Must be a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

// Validações para login
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Must be a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

/**
 * @swagger
 * components:
 *   schemas:
 *     UserAuth:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: password123
 *     AuthResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         token:
 *           type: string
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             email:
 *               type: string
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar um novo usuário
 *     description: Cria uma nova conta de usuário no sistema
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserAuth'
 *           example:
 *             email: user@example.com
 *             password: password123
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               message: User created successfully
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               user:
 *                 id: 1
 *                 email: user@example.com
 *       400:
 *         description: Erro de validação ou usuário já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Criar novo usuário
    const user = await User.create({ email, password });

    // Gerar token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ 
      message: 'User created successfully',
      token, 
      user: { id: user.id, email: user.email } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Autenticar usuário
 *     description: Realiza login de um usuário existente
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserAuth'
 *           example:
 *             email: user@example.com
 *             password: password123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               message: Login successful
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               user:
 *                 id: 1
 *                 email: user@example.com
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar se o usuário existe
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verificar senha
    const isValidPassword = await user.validPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Gerar token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({ 
      message: 'Login successful',
      token, 
      user: { id: user.id, email: user.email } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;