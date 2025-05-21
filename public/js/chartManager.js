class ChartManager {
    constructor() {
        this.chart = null;
        this.data = {
            labels: [],
            datasets: [{
                label: 'Emotion Score',
                data: [],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.4,
                fill: true
            }]
        };
        this.initializeChart();
    }

    initializeChart() {
        const ctx = document.getElementById('emotionChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: this.data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        min: -1,
                        max: 1,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                if (value === 1) return 'Positive';
                                if (value === 0) return 'Neutral';
                                if (value === -1) return 'Negative';
                                return value;
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Emotion Tracking'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                if (value === 1) return 'Positive';
                                if (value === 0) return 'Neutral';
                                if (value === -1) return 'Negative';
                                return value;
                            }
                        }
                    }
                }
            }
        });
    }

    addDataPoint(emotionData) {
        const timestamp = new Date(emotionData.timestamp).toLocaleTimeString();
        
        this.data.labels.push(timestamp);
        this.data.datasets[0].data.push(emotionData.score);

        // Keep only last 20 data points for better visualization
        if (this.data.labels.length > 20) {
            this.data.labels.shift();
            this.data.datasets[0].data.shift();
        }

        this.chart.update();
    }

    clearChart() {
        this.data.labels = [];
        this.data.datasets[0].data = [];
        this.chart.update();
    }

    getChartData() {
        return {
            labels: this.data.labels,
            scores: this.data.datasets[0].data
        };
    }
}

// Export for use in other modules
window.ChartManager = ChartManager; 