class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'emotion_tracking_data';
        this.currentSession = {
            id: this.generateSessionId(),
            startTime: new Date().toISOString(),
            endTime: null,
            data: []
        };
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    saveEmotionData(emotionData) {
        this.currentSession.data.push(emotionData);
        this.saveToLocalStorage();
    }

    endSession() {
        this.currentSession.endTime = new Date().toISOString();
        this.saveToLocalStorage();
        
        // Prepare data for future MongoDB storage
        const sessionData = {
            ...this.currentSession,
            totalScore: this.calculateTotalScore(),
            emotionSummary: this.generateEmotionSummary()
        };

        // Reset current session
        this.currentSession = {
            id: this.generateSessionId(),
            startTime: new Date().toISOString(),
            endTime: null,
            data: []
        };

        return sessionData;
    }

    calculateTotalScore() {
        return this.currentSession.data.reduce((sum, data) => sum + data.score, 0);
    }

    generateEmotionSummary() {
        const summary = {
            positive: 0,
            neutral: 0,
            negative: 0
        };

        this.currentSession.data.forEach(data => {
            if (data.score === 1) summary.positive++;
            else if (data.score === 0) summary.neutral++;
            else if (data.score === -1) summary.negative++;
        });

        return summary;
    }

    saveToLocalStorage() {
        const allSessions = this.getAllSessions();
        const existingSessionIndex = allSessions.findIndex(s => s.id === this.currentSession.id);

        if (existingSessionIndex !== -1) {
            allSessions[existingSessionIndex] = this.currentSession;
        } else {
            allSessions.push(this.currentSession);
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allSessions));
    }

    getAllSessions() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    getSessionById(sessionId) {
        const allSessions = this.getAllSessions();
        return allSessions.find(session => session.id === sessionId);
    }

    deleteSession(sessionId) {
        const allSessions = this.getAllSessions();
        const updatedSessions = allSessions.filter(session => session.id !== sessionId);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedSessions));
    }

    clearAllSessions() {
        localStorage.removeItem(this.STORAGE_KEY);
    }

    // Future MongoDB integration methods
    async saveToMongoDB(sessionData) {
        try {
            const response = await fetch('/api/tracking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sessionData)
            });

            if (!response.ok) {
                throw new Error('Failed to save to MongoDB');
            }

            return await response.json();
        } catch (error) {
            console.error('Error saving to MongoDB:', error);
            throw error;
        }
    }

    async getSessionsFromMongoDB() {
        try {
            const response = await fetch('/api/tracking');
            if (!response.ok) {
                throw new Error('Failed to fetch from MongoDB');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching from MongoDB:', error);
            throw error;
        }
    }
}

// Export for use in other modules
window.StorageManager = StorageManager; 