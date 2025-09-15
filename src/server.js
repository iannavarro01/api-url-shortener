require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/database');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Sincronizar modelos com o banco (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  sequelize.sync({ alter: true })
    .then(() => console.log('Database synchronized'))
    .catch(err => console.error('Error syncing database:', err));
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});