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
        // Removed: Auto-save on every data point. This can be inefficient.
        // this.saveToLocalStorage();
    }

    endSession() {
        this.currentSession.endTime = new Date().toISOString();

        // Get all existing sessions
        const allSessions = this.getAllSessions();

        // Find if this session already exists (e.g., if page was refreshed during a session)
        const existingSessionIndex = allSessions.findIndex(s => s.id === this.currentSession.id);

        if (existingSessionIndex !== -1) {
            // Update existing session
            allSessions[existingSessionIndex] = {
                 ...this.currentSession,
                 totalScore: this.calculateTotalScore(),
                 emotionSummary: this.generateEmotionSummary()
             };
        } else {
            // Add new session to the list
            allSessions.push({
                ...this.currentSession,
                totalScore: this.calculateTotalScore(),
                emotionSummary: this.generateEmotionSummary()
            });
        }

        // Save the updated list of all sessions to localStorage
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allSessions));

        // Prepare data for future MongoDB storage (optional)
        const sessionDataForMongoDB = allSessions[existingSessionIndex !== -1 ? existingSessionIndex : allSessions.length - 1]; // Get the session data that was just saved/updated

        // Reset current session for a new start
        this.currentSession = {
            id: this.generateSessionId(),
            startTime: new Date().toISOString(),
            endTime: null,
            data: []
        };

        // We return the session data that was just saved for potential external use (like MongoDB save)
        return sessionDataForMongoDB;
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
        // Removed: This method is no longer needed in its previous form.
        // Logic moved to endSession and potentially saveEmotionData if needed.
        // const allSessions = this.getAllSessions();
        // const existingSessionIndex = allSessions.findIndex(s => s.id === this.currentSession.id);

        // if (existingSessionIndex !== -1) {
        //     allSessions[existingSessionIndex] = this.currentSession;
        // } else {
        //     allSessions.push(this.currentSession);
        // }

        // localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allSessions));
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