class SessionDetail {
    constructor() {
        this.storageManager = new StorageManager();
        this.chartManager = new ChartManager();
        this.sessionId = this.getSessionIdFromUrl();
        this.session = null;
        this.initialize();
    }

    getSessionIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('sessionId');
    }

    async initialize() {
        if (!this.sessionId) {
            this.showError('ID Sesi tidak ditemukan');
            return;
        }

        try {
            this.session = this.storageManager.getSession(this.sessionId);
            if (!this.session) {
                this.showError('Sesi tidak ditemukan');
                return;
            }

            if (!this.session.emotionData || this.session.emotionData.length === 0) {
                this.showError('Data emosi tidak tersedia untuk sesi ini');
                return;
            }

            this.updateSessionInfo();
            this.updateEmotionSummary();
            this.createEmotionDistributionChart();
            this.createEmotionTimelineChart();
            this.createEmotionTimeline();
        } catch (error) {
            console.error('Error initializing session detail:', error);
            this.showError('Terjadi kesalahan saat memuat detail sesi');
        }
    }

    updateSessionInfo() {
        try {
            const startDate = new Date(this.session.startTime);
            const endDate = this.session.endTime ? new Date(this.session.endTime) : new Date();
            const duration = this.calculateDuration(startDate, endDate);

            document.getElementById('sessionDate').textContent = `Tanggal: ${startDate.toLocaleDateString('id-ID')}`;
            document.getElementById('sessionDuration').textContent = `Durasi: ${duration}`;
        } catch (error) {
            console.error('Error updating session info:', error);
        }
    }

    calculateDuration(start, end) {
        try {
            const diff = end - start;
            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            return `${minutes}m ${seconds}s`;
        } catch (error) {
            console.error('Error calculating duration:', error);
            return 'Tidak tersedia';
        }
    }

    updateEmotionSummary() {
        try {
            const emotions = this.session.emotionData.map(data => data.emotion);
            const dominantEmotion = this.getDominantEmotion(emotions);
            const averageConfidence = this.calculateAverageConfidence();

            document.getElementById('dominantEmotion').textContent = this.translateEmotion(dominantEmotion);
            document.getElementById('averageConfidence').textContent = `${(averageConfidence * 100).toFixed(1)}%`;
        } catch (error) {
            console.error('Error updating emotion summary:', error);
        }
    }

    getDominantEmotion(emotions) {
        try {
            const counts = emotions.reduce((acc, emotion) => {
                acc[emotion] = (acc[emotion] || 0) + 1;
                return acc;
            }, {});

            return Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
        } catch (error) {
            console.error('Error getting dominant emotion:', error);
            return 'neutral';
        }
    }

    calculateAverageConfidence() {
        try {
            const confidences = this.session.emotionData.map(data => data.score);
            return confidences.reduce((a, b) => a + b, 0) / confidences.length;
        } catch (error) {
            console.error('Error calculating average confidence:', error);
            return 0;
        }
    }

    createEmotionDistributionChart() {
        try {
            const emotions = this.session.emotionData.map(data => data.emotion);
            const distribution = this.calculateEmotionDistribution(emotions);
            
            this.chartManager.createDistributionChart('emotionDistributionChart', distribution);
        } catch (error) {
            console.error('Error creating emotion distribution chart:', error);
        }
    }

    createEmotionTimelineChart() {
        try {
            const timestamps = this.session.emotionData.map(data => new Date(data.timestamp));
            const scores = this.session.emotionData.map(data => data.score);

            this.chartManager.createTimelineChart('emotionTimelineChart', timestamps, scores);
        } catch (error) {
            console.error('Error creating emotion timeline chart:', error);
        }
    }

    createEmotionTimeline() {
        try {
            const timeline = document.getElementById('emotionTimeline');
            timeline.innerHTML = '';

            this.session.emotionData.forEach(data => {
                const timestamp = new Date(data.timestamp);
                const item = document.createElement('div');
                item.className = 'timeline-item';
                item.innerHTML = `
                    <div class="timeline-time">${timestamp.toLocaleTimeString('id-ID')}</div>
                    <div class="timeline-content">
                        <div class="emotion">${this.translateEmotion(data.emotion)}</div>
                        <div class="confidence">Kepercayaan: ${(data.score * 100).toFixed(1)}%</div>
                    </div>
                `;
                timeline.appendChild(item);
            });
        } catch (error) {
            console.error('Error creating emotion timeline:', error);
        }
    }

    calculateEmotionDistribution(emotions) {
        try {
            return emotions.reduce((acc, emotion) => {
                acc[emotion] = (acc[emotion] || 0) + 1;
                return acc;
            }, {});
        } catch (error) {
            console.error('Error calculating emotion distribution:', error);
            return {};
        }
    }

    translateEmotion(emotion) {
        return this.chartManager.translateEmotion(emotion);
    }

    showError(message) {
        const container = document.querySelector('.session-detail-container');
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
                <a href="/" class="btn primary">Kembali ke Beranda</a>
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SessionDetail();
}); 