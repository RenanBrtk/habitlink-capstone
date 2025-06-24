const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');
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

// Journal routes
router.get('/journal', authMiddleware, journalController.getJournalEntries);
router.get('/journal/stats', authMiddleware, journalController.getJournalStats);
router.get('/journal/:entry_id', authMiddleware, journalController.getJournalEntryById);
router.post('/journal', authMiddleware, journalController.createJournalEntry);
router.put('/journal/:entry_id', authMiddleware, journalController.updateJournalEntry);
router.delete('/journal/:entry_id', authMiddleware, journalController.deleteJournalEntry);

module.exports = router;
