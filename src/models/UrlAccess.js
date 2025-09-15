const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UrlAccess = sequelize.define('UrlAccess', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  shortened_url_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'url_accesses',
  timestamps: true,
  createdAt: 'accessed_at',
  updatedAt: false
});

module.exports = UrlAccess;