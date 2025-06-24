const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const JournalEntry = sequelize.define('JournalEntry', {
  entry_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  entry_date: { type: DataTypes.DATEONLY, allowNull: false },
  content: { type: DataTypes.TEXT },
  mood: { type: DataTypes.ENUM('excellent', 'good', 'okay', 'difficult', 'challenging') },
  tags: { type: DataTypes.TEXT },
}, {
  tableName: 'journal_entries',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'entry_date'],
      name: 'unique_user_entry_date'
    }
  ]
});

module.exports = JournalEntry;
