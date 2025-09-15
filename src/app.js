const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');
const { specs, swaggerUi } = require('./config/swagger');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rota para redirecionamento (encurtadas)
app.use('/', require('./routes/urls'));

module.exports = app;