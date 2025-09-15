const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ShortenedUrl = sequelize.define('ShortenedUrl', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  original_url: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      isUrl: true
    }
  },
  short_code: {
    type: DataTypes.STRING(6),
    allowNull: false,
    unique: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  click_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'shortened_urls',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  defaultScope: {
    where: {
      deleted_at: null
    }
  }
});

module.exports = ShortenedUrl;