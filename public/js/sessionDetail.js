document.addEventListener('DOMContentLoaded', () => {
    const storageManager = new StorageManager();
    // Removed UIController instance as it is not needed on this page
    // const uiController = new UIController(); // For sidebar toggle

    // Get session ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('sessionId');

    if (!sessionId) {
        console.error('Session ID not found in URL');
        // Optionally redirect back to history page or show an error message
        return;
    }

    // Get session data
    const session = storageManager.getSessionById(sessionId);

    if (!session) {
        console.error('Session data not found for ID:', sessionId);
        // Optionally redirect back to history page or show an error message
        return;
    }

    // Display session info
    document.getElementById('detail-session-id').textContent = session.id;
    document.getElementById('detail-start-time').textContent = new Date(session.startTime).toLocaleString();
    document.getElementById('detail-end-time').textContent = session.endTime ? new Date(session.endTime).toLocaleString() : 'Ongoing';
    document.getElementById('detail-total-score').textContent = session.totalScore || 0;
    document.getElementById('detail-positive-count').textContent = session.emotionSummary?.positive || 0;
    document.getElementById('detail-neutral-count').textContent = session.emotionSummary?.neutral || 0;
    document.getElementById('detail-negative-count').textContent = session.emotionSummary?.negative || 0;

    // Calculate and display average score
    const averageScore = session.data.length > 0 ? session.data.reduce((sum, d) => sum + d.score, 0) / session.data.length : 0;
    document.getElementById('detail-average-score').textContent = averageScore.toFixed(2); // Display with 2 decimal places

    // Prepare data for line chart by aggregating scores into intervals
    const intervalSeconds = 5; // Aggregate data every 5 seconds
    const aggregatedData = {};
    const startTime = new Date(session.startTime).getTime();

    session.data.forEach(dataPoint => {
        const timestamp = new Date(dataPoint.timestamp).getTime();
        const timeSinceStartSeconds = Math.floor((timestamp - startTime) / 1000);
        const interval = Math.floor(timeSinceStartSeconds / intervalSeconds);

        if (!aggregatedData[interval]) {
            aggregatedData[interval] = {
                scores: [],
                startTime: timestamp // Use the timestamp of the first data point in the interval as the interval start time
            };
        }
        aggregatedData[interval].scores.push(dataPoint.score);
    });

    const chartLabels = [];
    const chartAverageScores = [];

    // Sort intervals and calculate average score for each
    Object.keys(aggregatedData).sort((a, b) => a - b).forEach(intervalKey => {
        const interval = aggregatedData[intervalKey];
        const averageScore = interval.scores.reduce((sum, score) => sum + score, 0) / interval.scores.length;
        
        // Calculate time in minutes for the label, relative to session start
        const intervalStartTime = interval.startTime;
        const timeInMinutes = (intervalStartTime - startTime) / (1000 * 60);

        chartLabels.push(timeInMinutes.toFixed(1)); // Display time in minutes with 1 decimal place
        chartAverageScores.push(averageScore.toFixed(2)); // Display average score with 2 decimal places
    });

    // Initialize and display line chart
    const ctx = document.getElementById('sessionEmotionChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: [
                {
                    label: 'Average Emotion Score',
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    data: chartAverageScores,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: -1,
                    max: 1,
                    ticks: {
                        stepSize: 0.5, // Adjust step size for score range
                        callback: function(value) {
                             if (value === 1) return 'Positive';
                             if (value === 0) return 'Neutral';
                             if (value === -1) return 'Negative';
                             if (value === 0.5) return 'Mild Positive';
                             if (value === -0.5) return 'Mild Negative';
                             return null; // Hide other tick labels
                        }
                    },
                    title: {
                        display: true,
                        text: 'Average Emotion Score'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time (minutes from start)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Average Emotion Trend Over Time' // Update title
                },
                 tooltip: {
                     callbacks: {
                         label: function(context) {
                             const label = context.dataset.label || '';
                             const value = context.raw;
                             let emotion = '';
                             if (value >= 0.5) emotion = 'Positive';
                             else if (value <= -0.5) emotion = 'Negative';
                             else emotion = 'Neutral';
                             return `${label}: ${value} (${emotion})`;
                         }
                     }
                 }
            }
        }
    });

    // Initialize and display session summary pie chart
    const summaryCtx = document.getElementById('sessionSummaryChart').getContext('2d');
    new Chart(summaryCtx, {
        type: 'pie',
        data: {
            labels: ['Positive', 'Neutral', 'Negative'],
            datasets: [
                {
                    label: 'Emotion Count',
                    backgroundColor: ['#2ecc71', '#f1c40f', '#e74c3c'],
                    data: [
                        session.emotionSummary?.positive || 0,
                        session.emotionSummary?.neutral || 0,
                        session.emotionSummary?.negative || 0
                    ]
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Emotion Distribution for this Session'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw;
                            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}); 