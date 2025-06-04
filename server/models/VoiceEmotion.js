const mongoose = require('mongoose');

const voiceEmotionSchema = new mongoose.Schema({
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
    audioData: [{
        timestamp: {
            type: Date,
            required: true
        },
        emotion: {
            type: String,
            required: true,
            enum: ['happy', 'sad', 'angry', 'neutral', 'fear', 'surprise']
        },
        confidence: {
            type: Number,
            required: true,
            min: 0,
            max: 1
        },
        audioFeatures: {
            pitch: Number,
            intensity: Number,
            tempo: Number
        }
    }],
    summary: {
        dominantEmotion: {
            type: String,
            required: true
        },
        emotionDistribution: {
            happy: { type: Number, default: 0 },
            sad: { type: Number, default: 0 },
            angry: { type: Number, default: 0 },
            neutral: { type: Number, default: 0 },
            fear: { type: Number, default: 0 },
            surprise: { type: Number, default: 0 }
        },
        averageConfidence: {
            type: Number,
            required: true
        }
    }
}, {
    timestamps: true
});

// Menambahkan indeks untuk pencarian yang lebih cepat
voiceEmotionSchema.index({ sessionId: 1 });
voiceEmotionSchema.index({ startTime: -1 });

module.exports = mongoose.model('VoiceEmotion', voiceEmotionSchema); 