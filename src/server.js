const express = require('express');
const cors = require('cors');
const path = require('path');
const { getNextChapterDate } = require('./scraper');
require('dotenv').config({ path: path.join(__dirname, '../config/.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

// Single static middleware
app.use(express.static(path.join(__dirname, '../public')));

// Root route handler
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API endpoint for next chapter
app.get('/api/next-chapter', async (req, res) => {
    try {
        console.log('Fetching next chapter date...');
        const date = await getNextChapterDate();
        res.json({ success: true, raw_date: date });
    } catch (error) {
        console.error('Error fetching chapter date:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch chapter date',
            message: error.message
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'The requested resource was not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});