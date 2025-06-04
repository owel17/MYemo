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
                emotionData: []
            };
        }
        
        // Validasi data emosi
        if (!emotionData || typeof emotionData !== 'object') {
            console.error('Invalid emotion data format:', emotionData);
            return;
        }

        // Pastikan data memiliki properti yang diperlukan
        const validEmotion = {
            timestamp: emotionData.timestamp || new Date().toISOString(),
            emotion: emotionData.emotion || 'neutral',
            score: typeof emotionData.score === 'number' ? emotionData.score : 0
        };
        
        this.currentSession.emotionData.push(validEmotion);
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

            this.currentSession.emotionData.forEach(emotion => {
                if (emotion.score > 0.6) {
                    emotionCounts.positive++;
                } else if (emotion.score < 0.4) {
                    emotionCounts.negative++;
                } else {
                    emotionCounts.neutral++;
                }
                totalScore += emotion.score;
            });

            // Add statistics to the session object
            this.currentSession.emotionSummary = emotionCounts;
            this.currentSession.totalScore = this.currentSession.emotionData.length > 0 
                ? totalScore / this.currentSession.emotionData.length 
                : 0;

            const sessionData = { ...this.currentSession };
            this.currentSession = null;
            this.saveToLocalStorage();
            return sessionData;
        }
        return null;
    }

    getAllSessions() {
        try {
            const sessions = localStorage.getItem(this.STORAGE_KEY);
            return sessions ? JSON.parse(sessions) : [];
        } catch (error) {
            console.error('Error getting sessions:', error);
            return [];
        }
    }

    getSession(sessionId) {
        try {
            const sessions = this.getAllSessions();
            return sessions.find(session => session.id === sessionId);
        } catch (error) {
            console.error('Error getting session:', error);
            return null;
        }
    }

    deleteSession(sessionId) {
        try {
            const sessions = this.getAllSessions();
            const updatedSessions = sessions.filter(session => session.id !== sessionId);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedSessions));
        } catch (error) {
            console.error('Error deleting session:', error);
        }
    }

    saveToLocalStorage() {
        try {
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
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    getStatistics() {
        try {
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

                if (session.emotionData && Array.isArray(session.emotionData)) {
                    session.emotionData.forEach(emotion => {
                        if (!stats.averageEmotions[emotion.emotion]) {
                            stats.averageEmotions[emotion.emotion] = 0;
                        }
                        stats.averageEmotions[emotion.emotion]++;
                    });
                }
            });

            // Calculate averages
            const totalEmotions = sessions.reduce((sum, session) => 
                sum + (session.emotionData && Array.isArray(session.emotionData) ? session.emotionData.length : 0), 0);
            
            if (totalEmotions > 0) {
                Object.keys(stats.averageEmotions).forEach(key => {
                    stats.averageEmotions[key] = stats.averageEmotions[key] / totalEmotions;
                });
            }

            return stats;
        } catch (error) {
            console.error('Error getting statistics:', error);
            return {
                totalSessions: 0,
                totalDuration: 0,
                averageEmotions: {}
            };
        }
    }
}

// Export for use in other modules
window.StorageManager = StorageManager; 