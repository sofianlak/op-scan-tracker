const express = require('express');
const cors = require('cors'); // Import CORS
const { getNextChapterDate } = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

app.get('/api/next-chapter', async (req, res) => {
    try {
        console.log('Fetching next chapter date...');
        const date = await getNextChapterDate(); // Fetch fresh data each time

        res.json({ success: true, raw_date: date });
    } catch (error) {
        console.error('Error in endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch chapter date',
            message: error.message
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});