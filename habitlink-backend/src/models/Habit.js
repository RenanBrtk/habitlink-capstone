const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Habit = sequelize.define('Habit', {
  habit_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  frequency: { type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'custom'), defaultValue: 'daily' },
  frequency_value: { type: DataTypes.INTEGER, defaultValue: 1 },
  color: { type: DataTypes.STRING, defaultValue: '#007AFF' },
  icon: { type: DataTypes.STRING },
  target_time: { type: DataTypes.TIME },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  start_date: { type: DataTypes.DATEONLY, allowNull: false },
  end_date: { type: DataTypes.DATEONLY },
}, {
  tableName: 'habits',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Habit;
