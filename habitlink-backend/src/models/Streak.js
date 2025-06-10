const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Streak = sequelize.define('Streak', {
  streak_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  habit_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  current_streak: { type: DataTypes.INTEGER, defaultValue: 0 },
  longest_streak: { type: DataTypes.INTEGER, defaultValue: 0 },
  last_completed_date: { type: DataTypes.DATEONLY },
}, {
  tableName: 'streaks', 
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Streak;

