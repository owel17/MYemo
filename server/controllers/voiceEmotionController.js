const VoiceEmotion = require('../models/VoiceEmotion');

// Memulai sesi deteksi emosi suara
exports.startSession = async (req, res) => {
    try {
        const session = new VoiceEmotion({
            sessionId: Date.now().toString(),
            startTime: new Date(),
            endTime: new Date(),
            audioData: [],
            summary: {
                dominantEmotion: 'neutral',
                emotionDistribution: {
                    happy: 0,
                    sad: 0,
                    angry: 0,
                    neutral: 0,
                    fear: 0,
                    surprise: 0
                },
                averageConfidence: 0
            }
        });
        await session.save();
        res.status(201).json(session);
    } catch (error) {
        res.status(400).json({
            error: 'Error starting voice emotion session',
            message: error.message
        });
    }
};

// Menyimpan data emosi suara
exports.saveEmotionData = async (req, res) => {
    try {
        const { sessionId, emotionData } = req.body;
        const session = await VoiceEmotion.findOne({ sessionId });
        
        if (!session) {
            return res.status(404).json({
                error: 'Session not found'
            });
        }

        session.audioData.push(emotionData);
        
        // Update summary
        const emotionCounts = session.audioData.reduce((acc, data) => {
            acc[data.emotion] = (acc[data.emotion] || 0) + 1;
            return acc;
        }, {});

        session.summary.emotionDistribution = {
            ...session.summary.emotionDistribution,
            ...emotionCounts
        };

        // Calculate dominant emotion
        const dominantEmotion = Object.entries(emotionCounts)
            .reduce((a, b) => a[1] > b[1] ? a : b)[0];
        session.summary.dominantEmotion = dominantEmotion;

        // Calculate average confidence
        const totalConfidence = session.audioData.reduce((sum, data) => sum + data.confidence, 0);
        session.summary.averageConfidence = totalConfidence / session.audioData.length;

        await session.save();
        res.json(session);
    } catch (error) {
        res.status(400).json({
            error: 'Error saving voice emotion data',
            message: error.message
        });
    }
};

// Mengakhiri sesi dan mendapatkan hasil
exports.endSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await VoiceEmotion.findOne({ sessionId });
        
        if (!session) {
            return res.status(404).json({
                error: 'Session not found'
            });
        }

        session.endTime = new Date();
        await session.save();
        
        res.json(session);
    } catch (error) {
        res.status(400).json({
            error: 'Error ending voice emotion session',
            message: error.message
        });
    }
};

// Mendapatkan riwayat sesi
exports.getSessionHistory = async (req, res) => {
    try {
        const sessions = await VoiceEmotion.find()
            .sort({ startTime: -1 })
            .limit(10);
        res.json(sessions);
    } catch (error) {
        res.status(500).json({
            error: 'Error fetching session history',
            message: error.message
        });
    }
}; 