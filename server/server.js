const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const voiceEmotionRoutes = require('./routes/voiceEmotionRoutes');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/voice', voiceEmotionRoutes);

// Routes untuk voice emotion
app.post('/api/voice/sessions', (req, res) => {
    const sessionId = Date.now().toString();
    const session = {
        sessionId,
        startTime: new Date(),
        endTime: new Date(),
        audioData: [],
        summary: {
            dominantEmotion: 'neutral',
            emotionDistribution: {
                happy: 0,
                sad: 0,
                angry: 0,
                neutral: 0
            },
            averageConfidence: 0
        }
    };
    res.status(201).json(session);
});

app.post('/api/voice/sessions/:sessionId/data', (req, res) => {
    const { sessionId } = req.params;
    const { emotionData } = req.body;
    res.json({ success: true, sessionId, emotionData });
});

app.put('/api/voice/sessions/:sessionId/end', (req, res) => {
    const { sessionId } = req.params;
    res.json({ success: true, sessionId, endTime: new Date() });
});

app.get('/api/voice/sessions/history', (req, res) => {
    res.json([]);
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 