const Tracking = require('../models/Tracking');

// Get all tracking sessions
exports.getAllSessions = async (req, res) => {
    try {
        const sessions = await Tracking.find()
            .sort({ startTime: -1 })
            .limit(50);
        res.json(sessions);
    } catch (error) {
        res.status(500).json({
            error: 'Error fetching sessions',
            message: error.message
        });
    }
};

// Get a single session by ID
exports.getSessionById = async (req, res) => {
    try {
        const session = await Tracking.findOne({ sessionId: req.params.id });
        if (!session) {
            return res.status(404).json({
                error: 'Session not found'
            });
        }
        res.json(session);
    } catch (error) {
        res.status(500).json({
            error: 'Error fetching session',
            message: error.message
        });
    }
};

// Create a new tracking session
exports.createSession = async (req, res) => {
    try {
        const sessionData = req.body;
        
        // Validate required fields
        if (!sessionData.sessionId || !sessionData.startTime || !sessionData.endTime) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }

        // Create new session
        const session = new Tracking(sessionData);
        await session.save();

        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({
            error: 'Error creating session',
            message: error.message
        });
    }
};

// Delete a session
exports.deleteSession = async (req, res) => {
    try {
        const result = await Tracking.deleteOne({ sessionId: req.params.id });
        if (result.deletedCount === 0) {
            return res.status(404).json({
                error: 'Session not found'
            });
        }
        res.json({ message: 'Session deleted successfully' });
    } catch (error) {
        res.status(500).json({
            error: 'Error deleting session',
            message: error.message
        });
    }
};

// Get session statistics
exports.getStatistics = async (req, res) => {
    try {
        const stats = await Tracking.aggregate([
            {
                $group: {
                    _id: null,
                    totalSessions: { $sum: 1 },
                    averageScore: { $avg: '$totalScore' },
                    totalPositive: { $sum: '$emotionSummary.positive' },
                    totalNeutral: { $sum: '$emotionSummary.neutral' },
                    totalNegative: { $sum: '$emotionSummary.negative' }
                }
            }
        ]);

        res.json(stats[0] || {
            totalSessions: 0,
            averageScore: 0,
            totalPositive: 0,
            totalNeutral: 0,
            totalNegative: 0
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error fetching statistics',
            message: error.message
        });
    }
}; 