const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light'
        },
        notifications: {
            type: Boolean,
            default: true
        }
    },
    emotionHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tracking'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Menambahkan indeks untuk pencarian yang lebih cepat
userProfileSchema.index({ userId: 1 });
userProfileSchema.index({ email: 1 });

module.exports = mongoose.model('UserProfile', userProfileSchema); 