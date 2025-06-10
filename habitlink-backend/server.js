require('dotenv').config();
const app = require('./src/app');
const sequelize = require('./config/database');

// Test DB connection and start server
sequelize.authenticate()
    .then(() => {
        console.log('Database connected');
        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to DB:', err);
    });
