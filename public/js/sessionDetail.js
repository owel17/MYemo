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
        return urlParams.get('id');
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
        const startDate = new Date(this.session.startTime);
        const endDate = new Date(this.session.endTime);
        const duration = this.calculateDuration(startDate, endDate);

        document.getElementById('sessionDate').textContent = `Tanggal: ${startDate.toLocaleDateString('id-ID')}`;
        document.getElementById('sessionDuration').textContent = `Durasi: ${duration}`;
    }

    calculateDuration(start, end) {
        const diff = end - start;
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return `${minutes}m ${seconds}s`;
    }

    updateEmotionSummary() {
        const emotions = this.session.emotionData.map(data => data.emotion);
        const dominantEmotion = this.getDominantEmotion(emotions);
        const averageConfidence = this.calculateAverageConfidence();

        document.getElementById('dominantEmotion').textContent = this.translateEmotion(dominantEmotion);
        document.getElementById('averageConfidence').textContent = `${(averageConfidence * 100).toFixed(1)}%`;
    }

    getDominantEmotion(emotions) {
        const counts = emotions.reduce((acc, emotion) => {
            acc[emotion] = (acc[emotion] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    }

    calculateAverageConfidence() {
        const confidences = this.session.emotionData.map(data => data.score);
        return confidences.reduce((a, b) => a + b, 0) / confidences.length;
    }

    createEmotionDistributionChart() {
        const emotions = this.session.emotionData.map(data => data.emotion);
        const distribution = this.calculateEmotionDistribution(emotions);
        
        const ctx = document.getElementById('emotionDistributionChart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(distribution).map(this.translateEmotion),
                datasets: [{
                    data: Object.values(distribution),
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createEmotionTimelineChart() {
        const timestamps = this.session.emotionData.map(data => new Date(data.timestamp));
        const scores = this.session.emotionData.map(data => data.score);

        const ctx = document.getElementById('emotionTimelineChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: timestamps.map(date => date.toLocaleTimeString('id-ID')),
                datasets: [{
                    label: 'Skor Emosi',
                    data: scores,
                    borderColor: '#36A2EB',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1
                    }
                }
            }
        });
    }

    createEmotionTimeline() {
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
    }

    calculateEmotionDistribution(emotions) {
        return emotions.reduce((acc, emotion) => {
            acc[emotion] = (acc[emotion] || 0) + 1;
            return acc;
        }, {});
    }

    translateEmotion(emotion) {
        const translations = {
            'happy': 'Bahagia',
            'sad': 'Sedih',
            'angry': 'Marah',
            'fearful': 'Takut',
            'disgusted': 'Jijik',
            'surprised': 'Terkejut',
            'neutral': 'Netral'
        };
        return translations[emotion] || emotion;
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
window.addEventListener('load', () => {
    new SessionDetail();
}); 