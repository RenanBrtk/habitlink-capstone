const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');
const jwt = require('jsonwebtoken');

// Simple auth middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Routes
router.get('/habits', authMiddleware, habitController.getHabits);
router.get('/habits/today', authMiddleware, habitController.getTodaysHabits);
router.post('/habits', authMiddleware, habitController.createHabit);
router.put('/habits/:habit_id', authMiddleware, habitController.updateHabit);
router.delete('/habits/:habit_id', authMiddleware, habitController.deleteHabit);
router.get('/habits/:habit_id', authMiddleware, habitController.getHabitById);
router.get('/habits/:habit_id/progress', authMiddleware, habitController.getHabitProgress);
router.post('/habits/:habit_id/complete', authMiddleware, habitController.markHabitComplete);

module.exports = router;
