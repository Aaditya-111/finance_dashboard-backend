require('./config/env');
const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await pool.query('SELECT NOW()');
        console.log('DATABASE CONNECTED SUCCESSFULLY');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV}`);
        });
    } catch (err) {
        console.error('Failed to Connect to Database:', err.message);
        process.exit(1);
    }
};

startServer();