const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const habitRoutes = require('./routes/habitRoutes');
const journalRoutes = require('./routes/journalRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api', habitRoutes);
app.use('/api', journalRoutes);
app.use('/api', userRoutes);

module.exports = app;
