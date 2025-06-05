class ChartManager {
    constructor() {
        this.charts = {};
        this.currentData = {
            timestamps: [],
            scores: []
        };
    }

    createDistributionChart(canvasId, data) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        return new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(data).map(this.translateEmotion),
                datasets: [{
                    data: Object.values(data),
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
                    },
                    title: {
                        display: true,
                        text: 'Distribusi Emosi'
                    }
                }
            }
        });
    }

    createTimelineChart(canvasId, timestamps, scores) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: timestamps.map(date => date.toLocaleTimeString('id-ID')),
                datasets: [{
                    label: 'Skor Emosi',
                    data: scores,
                    borderColor: '#36A2EB',
                    tension: 0.1,
                    fill: true,
                    backgroundColor: 'rgba(54, 162, 235, 0.1)'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Perubahan Emosi'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1,
                        title: {
                            display: true,
                            text: 'Skor Kepercayaan'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Waktu'
                        }
                    }
                }
            }
        });
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

    addDataPoint(emotionData) {
        const timestamp = new Date();
        const score = emotionData.score || 0;

        this.currentData.timestamps.push(timestamp);
        this.currentData.scores.push(score);

        // Update chart if it exists
        if (this.charts.timeline) {
            this.charts.timeline.data.labels = this.currentData.timestamps.map(date => date.toLocaleTimeString('id-ID'));
            this.charts.timeline.data.datasets[0].data = this.currentData.scores;
            this.charts.timeline.update();
        }
    }

    clearChart() {
        this.currentData = {
            timestamps: [],
            scores: []
        };
        if (this.charts.timeline) {
            this.charts.timeline.data.labels = [];
            this.charts.timeline.data.datasets[0].data = [];
            this.charts.timeline.update();
        }
    }
}

// Export for use in other modules
window.ChartManager = ChartManager; 