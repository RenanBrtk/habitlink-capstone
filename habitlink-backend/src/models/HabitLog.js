const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const HabitLog = sequelize.define('HabitLog', {
  log_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  habit_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  log_date: { type: DataTypes.DATEONLY, allowNull: false },
  completed: { type: DataTypes.BOOLEAN, defaultValue: false },
  notes: { type: DataTypes.TEXT },
  completed_at: { type: DataTypes.DATE },
}, {
  tableName: 'habit_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = HabitLog;
