const JournalEntry = require('../models/JournalEntry');
const { Op } = require('sequelize');

exports.getJournalEntries = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { limit = 20, offset = 0, search, mood, dateFrom, dateTo } = req.query;

    let whereClause = { user_id: userId };    // Add search filter
    if (search) {
      whereClause[Op.or] = [
        { content: { [Op.like]: `%${search}%` } },
        { tags: { [Op.like]: `%${search}%` } }
      ];
    }

    // Add mood filter
    if (mood && mood !== 'all') {
      whereClause.mood = mood;
    }

    // Add date range filter
    if (dateFrom && dateTo) {
      whereClause.entry_date = {
        [Op.between]: [dateFrom, dateTo]
      };
    } else if (dateFrom) {
      whereClause.entry_date = {
        [Op.gte]: dateFrom
      };
    } else if (dateTo) {
      whereClause.entry_date = {
        [Op.lte]: dateTo
      };
    }

    const entries = await JournalEntry.findAll({
      where: whereClause,
      order: [['entry_date', 'DESC'], ['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Get total count for pagination
    const totalCount = await JournalEntry.count({ where: whereClause });

    res.json({
      entries,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: totalCount > (parseInt(offset) + parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getJournalEntryById = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const entryId = req.params.entry_id;

    const entry = await JournalEntry.findOne({
      where: { entry_id: entryId, user_id: userId }
    });

    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    res.json(entry);
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createJournalEntry = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { content, mood, tags, entry_date } = req.body;

    // Validate required fields
    if (!entry_date) {
      return res.status(400).json({ message: 'Entry date is required' });
    }

    const newEntry = await JournalEntry.create({
      user_id: userId,
      entry_date: entry_date || new Date().toISOString().split('T')[0],
      content,
      mood,
      tags: tags ? JSON.stringify(tags) : null
    });

    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Error creating journal entry:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ message: 'Entry for this date already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

exports.updateJournalEntry = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const entryId = req.params.entry_id;

    const entry = await JournalEntry.findOne({
      where: { entry_id: entryId, user_id: userId }
    });    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    const { content, mood, tags, entry_date } = req.body;

    await entry.update({
      content: content !== undefined ? content : entry.content,
      mood: mood || entry.mood,
      tags: tags ? JSON.stringify(tags) : entry.tags,
      entry_date: entry_date || entry.entry_date
    });

    res.json(entry);
  } catch (error) {
    console.error('Error updating journal entry:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ message: 'Entry for this date already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

exports.deleteJournalEntry = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const entryId = req.params.entry_id;

    const entry = await JournalEntry.findOne({
      where: { entry_id: entryId, user_id: userId }
    });

    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    await entry.destroy();
    res.json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getJournalStats = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Get total entries count
    const totalEntries = await JournalEntry.count({
      where: { user_id: userId }
    });

    // Get current month entries
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const monthlyEntries = await JournalEntry.count({
      where: {
        user_id: userId,
        entry_date: {
          [Op.between]: [
            firstDayOfMonth.toISOString().split('T')[0],
            lastDayOfMonth.toISOString().split('T')[0]
          ]
        }
      }
    });

    // Get mood distribution for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const moodDistribution = await JournalEntry.findAll({
      where: {
        user_id: userId,
        entry_date: {
          [Op.gte]: thirtyDaysAgo.toISOString().split('T')[0]
        }
      },
      attributes: ['mood'],
      raw: true
    });

    const moodCounts = moodDistribution.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {});

    // Calculate current streak (consecutive days with entries)
    const recentEntries = await JournalEntry.findAll({
      where: { user_id: userId },
      attributes: ['entry_date'],
      order: [['entry_date', 'DESC']],
      limit: 30,
      raw: true
    });

    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const entryDates = [...new Set(recentEntries.map(entry => entry.entry_date))];

    for (let i = 0; i < entryDates.length; i++) {
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      const expectedDateStr = expectedDate.toISOString().split('T')[0];

      if (entryDates.includes(expectedDateStr)) {
        currentStreak++;
      } else {
        break;
      }
    }    res.json({
      totalEntries,
      monthlyEntries,
      currentStreak,
      moodDistribution: {
        excellent: moodCounts.excellent || 0,
        good: moodCounts.good || 0,
        okay: moodCounts.okay || 0,
        difficult: moodCounts.difficult || 0,
        challenging: moodCounts.challenging || 0
      }
    });
  } catch (error) {
    console.error('Error fetching journal stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUniqueMoods = async (req, res) => {
  try {
    console.log('getUniqueMoods API called for user:', req.user.user_id);
    const userId = req.user.user_id;
    
    const uniqueMoods = await JournalEntry.findAll({
      where: { user_id: userId },
      attributes: ['mood'],
      group: ['mood'],
      raw: true
    });

    const moods = uniqueMoods.map(entry => entry.mood).filter(mood => mood); // Filter out null/empty moods
    console.log('Found unique moods:', moods);
    
    res.json({ moods });
  } catch (error) {
    console.error('Error fetching unique moods:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
