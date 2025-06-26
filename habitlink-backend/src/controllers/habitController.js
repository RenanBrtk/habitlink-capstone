const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const Streak = require('../models/Streak');
const sequelize = require('../../config/database');
const { Op } = require('sequelize'); 

exports.getHabits = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const habits = await Habit.findAll({ where: { user_id: userId, is_active: true } });
    res.json(habits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createHabit = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { title, description, frequency, frequency_value, color, icon, target_time, start_date, end_date } = req.body;

    const newHabit = await Habit.create({
      user_id: userId,
      title,
      description,
      frequency,
      frequency_value,
      color,
      icon,
      target_time,
      start_date,
      end_date,
    });

    res.status(201).json(newHabit);
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateHabit = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const habitId = req.params.habit_id;

    const habit = await Habit.findOne({ where: { habit_id: habitId, user_id: userId } });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    await habit.update(req.body);
    res.json(habit);
  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteHabit = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const habitId = req.params.habit_id;

    const habit = await Habit.findOne({ where: { habit_id: habitId, user_id: userId } });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    await habit.destroy();
    res.json({ message: 'Habit deleted' });
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getHabitById = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const habitId = req.params.habit_id;

    const habit = await Habit.findOne({
      where: { habit_id: habitId, user_id: userId },
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // (Optional) later to also return streak, habit logs, etc.
    res.json(habit);
  } catch (error) {
    console.error('Error fetching habit:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getHabitProgress = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const habitId = req.params.habit_id;

    // Fetch habit
    const habit = await Habit.findOne({
      where: { habit_id: habitId, user_id: userId },
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Fetch streak
    const streak = await Streak.findOne({
      where: { habit_id: habitId, user_id: userId },
    });

    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const fromDate = thirtyDaysAgo.toISOString().split('T')[0];

    // Fetch last 30 days logs
    const logs = await HabitLog.findAll({
      where: {
        habit_id: habitId,
        user_id: userId,
        log_date: {
          [Op.gte]: fromDate,
        },
      },
      order: [['log_date', 'ASC']],
    });

    res.json({
      habit,
      streak,
      logs,
    });
  } catch (error) {
    console.error('Progress route error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.markHabitComplete = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const habitId = req.params.habit_id;
    const today = new Date().toISOString().split('T')[0];

    let log = await HabitLog.findOne({
      where: { habit_id: habitId, user_id: userId, log_date: today },
    });

    if (log && log.completed) {
      return res.status(400).json({ message: 'Already marked as complete' });
    }

    if (!log) {
      log = await HabitLog.create({
        habit_id: habitId,
        user_id: userId,
        log_date: today,
        completed: true,
        completed_at: new Date(),
      });
    } else {
      log.completed = true;
      log.completed_at = new Date();
      await log.save();
    }

    let streak = await Streak.findOne({
      where: { habit_id: habitId, user_id: userId },
    });

    if (!streak) {
      streak = await Streak.create({
        habit_id: habitId,
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_completed_date: today,
      });
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const lastCompleted = new Date(streak.last_completed_date);

      if (lastCompleted.toDateString() === yesterday.toDateString()) {
        streak.current_streak += 1;
      } else if (lastCompleted.toDateString() !== today) {
        streak.current_streak = 1;
      }

      if (streak.current_streak > streak.longest_streak) {
        streak.longest_streak = streak.current_streak;
      }

      streak.last_completed_date = today;
      await streak.save();
    }

    res.json({ message: 'Habit marked complete!', log, streak });
  } catch (error) {
    console.error('Complete error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to check if a habit is due today
const isHabitDueToday = (habit) => {
  const today = new Date();
  const startDate = new Date(habit.start_date);
  
  // If habit hasn't started yet
  if (today.toDateString() < startDate.toDateString()) {
    return false;
  }
  
  // If habit has ended
  if (habit.end_date && today.toDateString() > new Date(habit.end_date).toDateString()) {
    return false;
  }
  
  // Calculate days since start (inclusive of start date)
  const timeDiff = today.getTime() - startDate.getTime();
  const daysSinceStart = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  switch (habit.frequency) {
    case 'daily':
      return true; // Daily habits are always due if within date range
    
    case 'weekly':
      // Check if today is the same day of week as start_date
      return today.getDay() === startDate.getDay();
    
    case 'monthly':
      // Check if today is the same date of month as start_date
      const todayDate = today.getDate();
      const startDateOfMonth = startDate.getDate();
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      
      // Handle end-of-month cases (e.g., habit set for 31st but current month has only 30 days)
      if (startDateOfMonth > lastDayOfMonth) {
        return todayDate === lastDayOfMonth;
      }
      
      return todayDate === startDateOfMonth;
    
    case 'custom':
      // For custom frequency, check if it's due based on frequency_value (days interval)
      if (!habit.frequency_value || habit.frequency_value <= 0) {
        return false;
      }
      return daysSinceStart % habit.frequency_value === 0;
    
    default:
      return false;
  }
};

exports.getTodaysHabits = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const allHabits = await Habit.findAll({ 
      where: { user_id: userId, is_active: true } 
    });
    
    // Filter habits that are due today
    const todaysHabits = allHabits.filter(habit => isHabitDueToday(habit));
    
    res.json(todaysHabits);
  } catch (error) {
    console.error('Error fetching today\'s habits:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
