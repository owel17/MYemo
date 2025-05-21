const mongoose = require('mongoose');

const emotionDataSchema = new mongoose.Schema({
    emotion: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true,
        enum: [-1, 0, 1]
    },
    timestamp: {
        type: Date,
        required: true
    }
});

const trackingSessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    data: [emotionDataSchema],
    totalScore: {
        type: Number,
        required: true
    },
    emotionSummary: {
        positive: {
            type: Number,
            required: true,
            default: 0
        },
        neutral: {
            type: Number,
            required: true,
            default: 0
        },
        negative: {
            type: Number,
            required: true,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
trackingSessionSchema.index({ sessionId: 1 });
trackingSessionSchema.index({ startTime: -1 });
trackingSessionSchema.index({ totalScore: -1 });

module.exports = mongoose.model('Tracking', trackingSessionSchema); 