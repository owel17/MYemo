class StorageManager {
    constructor() {
        this.currentSession = null;
        this.STORAGE_KEY = 'emotion_tracker_sessions';
    }

    saveEmotionData(emotionData) {
        if (!this.currentSession) {
            this.currentSession = {
                id: Date.now().toString(),
                startTime: new Date().toISOString(),
                emotions: []
            };
        }
        
        this.currentSession.emotions.push({
            timestamp: new Date().toISOString(),
            ...emotionData
        });
        
        this.saveToLocalStorage();
    }

    endSession() {
        if (this.currentSession) {
            this.currentSession.endTime = new Date().toISOString();
            
            // Calculate statistics for the session
            const emotionCounts = {
                positive: 0,
                neutral: 0,
                negative: 0
            };
            let totalScore = 0;

            this.currentSession.emotions.forEach(emotion => {
                if (emotion.score === 1) {
                    emotionCounts.positive++;
                } else if (emotion.score === -1) {
                    emotionCounts.negative++;
                } else {
                    emotionCounts.neutral++;
                }
                totalScore += emotion.score;
            });

            // Add statistics to the session object
            this.currentSession.emotionSummary = emotionCounts;
            this.currentSession.totalScore = totalScore;

            const sessionData = { ...this.currentSession };
            this.currentSession = null;
            this.saveToLocalStorage();
            return sessionData;
        }
        return null;
    }

    getAllSessions() {
        const sessions = localStorage.getItem(this.STORAGE_KEY);
        return sessions ? JSON.parse(sessions) : [];
    }

    getSessionById(sessionId) {
        const sessions = this.getAllSessions();
        return sessions.find(session => session.id === sessionId);
    }

    deleteSession(sessionId) {
        const sessions = this.getAllSessions();
        const updatedSessions = sessions.filter(session => session.id !== sessionId);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedSessions));
    }

    saveToLocalStorage() {
        const sessions = this.getAllSessions();
        if (this.currentSession) {
            const existingSessionIndex = sessions.findIndex(s => s.id === this.currentSession.id);
            if (existingSessionIndex !== -1) {
                sessions[existingSessionIndex] = this.currentSession;
            } else {
                sessions.push(this.currentSession);
            }
        }
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
    }

    getStatistics() {
        const sessions = this.getAllSessions();
        const stats = {
            totalSessions: sessions.length,
            totalDuration: 0,
            averageEmotions: {}
        };

        sessions.forEach(session => {
            const startTime = new Date(session.startTime);
            const endTime = new Date(session.endTime || new Date());
            stats.totalDuration += (endTime - startTime) / 1000; // Convert to seconds

            session.emotions.forEach(emotion => {
                Object.keys(emotion).forEach(key => {
                    if (key !== 'timestamp') {
                        if (!stats.averageEmotions[key]) {
                            stats.averageEmotions[key] = 0;
                        }
                        stats.averageEmotions[key] += emotion[key];
                    }
                });
            });
        });

        // Calculate averages
        const totalEmotions = sessions.reduce((sum, session) => sum + session.emotions.length, 0);
        Object.keys(stats.averageEmotions).forEach(key => {
            stats.averageEmotions[key] = stats.averageEmotions[key] / totalEmotions;
        });

        return stats;
    }
}

// Export for use in other modules
window.StorageManager = StorageManager; 