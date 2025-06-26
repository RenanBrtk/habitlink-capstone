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
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    // Get all user habits
    const habits = await Habit.findAll({ 
      where: { user_id: userId, is_active: true } 
    });
    
    if (habits.length === 0) {
      return res.json({
        totalHabits: 0,
        currentStreak: 0,
        bestStreak: 0,
        successRate: 0,
        totalDaysCompleted: 0,
        totalPossibleDays: 0
      });
    }

    let totalCompletedDays = 0;
    let totalPossibleDays = 0;
    let totalCurrentStreaks = 0;
    let maxStreak = 0;
    
    // Get all streaks for the user
    const streaks = await Streak.findAll({
      where: { user_id: userId }
    });
    
    // Get all logs for the user (not limited to 30 days)
    const logs = await HabitLog.findAll({
      where: { user_id: userId },
      order: [['log_date', 'ASC']]
    });
    
    // Calculate stats for each habit
    for (const habit of habits) {
      const habitStreak = streaks.find(s => s.habit_id === habit.habit_id);
      const habitLogs = logs.filter(log => log.habit_id === habit.habit_id);
      
      // Calculate current streak and max streak
      const currentStreak = habitStreak?.current_streak || 0;
      const longestStreak = habitStreak?.longest_streak || 0;
      
      totalCurrentStreaks += currentStreak;
      maxStreak = Math.max(maxStreak, longestStreak);
      
      // Count completed days
      const completedDays = habitLogs.filter(log => log.completed).length;
      totalCompletedDays += completedDays;
      
      // Calculate possible days based on habit frequency and start date
      const startDate = new Date(habit.start_date);
      const today = new Date();
      const endDate = habit.end_date ? new Date(habit.end_date) : today;
      
      const daysSinceStart = Math.floor((Math.min(today, endDate) - startDate) / (1000 * 60 * 60 * 24)) + 1;
      
      let possibleDays = 0;
      switch (habit.frequency) {
        case 'daily':
          possibleDays = daysSinceStart;
          break;
        case 'weekly':
          possibleDays = Math.floor(daysSinceStart / 7) + (daysSinceStart % 7 >= (startDate.getDay() === today.getDay() ? 1 : 0) ? 1 : 0);
          break;
        case 'monthly':
          const monthsDiff = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth());
          possibleDays = monthsDiff + (today.getDate() >= startDate.getDate() ? 1 : 0);
          break;
        case 'custom':
          possibleDays = Math.floor(daysSinceStart / (habit.frequency_value || 1)) + 1;
          break;
      }
      
      totalPossibleDays += Math.max(possibleDays, 0);
    }
    
    // Calculate final stats
    const avgCurrentStreak = habits.length > 0 ? Math.round(totalCurrentStreaks / habits.length) : 0;
    const successRate = totalPossibleDays > 0 ? Math.round((totalCompletedDays / totalPossibleDays) * 100) : 0;
    
    res.json({
      totalHabits: habits.length,
      currentStreak: avgCurrentStreak,
      bestStreak: maxStreak,
      successRate: Math.min(successRate, 100), // Cap at 100%
      totalDaysCompleted: totalCompletedDays,
      totalPossibleDays: totalPossibleDays
    });
    
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
