const { sequelize } = require('../config/database');
const User = require('./User');
const ShortenedUrl = require('./ShortenedUrl');
const UrlAccess = require('./UrlAccess');

// Associações entre modelos
User.hasMany(ShortenedUrl, { foreignKey: 'user_id' });
ShortenedUrl.belongsTo(User, { foreignKey: 'user_id' });

ShortenedUrl.hasMany(UrlAccess, { foreignKey: 'shortened_url_id' });
UrlAccess.belongsTo(ShortenedUrl, { foreignKey: 'shortened_url_id' });

module.exports = {
  sequelize,
  User,
  ShortenedUrl,
  UrlAccess
};