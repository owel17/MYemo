class UIController {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.toggleBtn = document.getElementById('toggleSidebar');
        this.navLinks = document.querySelectorAll('.nav-links a');
        this.contentSections = document.querySelectorAll('.content-section');
        this.startBtn = document.getElementById('startDetection');
        this.stopBtn = document.getElementById('stopDetection');
        this.historyList = document.querySelector('.history-list');
        this.historyChartCanvas = document.getElementById('historyChart');
        this.historyChart = null;
        
        this.initializeEventListeners();
        this.initializeHistoryChart();
    }

    initializeEventListeners() {
        // Sidebar toggle
        this.toggleBtn.addEventListener('click', () => this.toggleSidebar());

        // Navigation
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(link);
            });
        });

        // Detection controls
        this.startBtn.addEventListener('click', () => this.handleStartDetection());
        this.stopBtn.addEventListener('click', () => this.handleStopDetection());
    }

    toggleSidebar() {
        this.sidebar.classList.toggle('collapsed');
    }

    handleNavigation(clickedLink) {
        // Update active state of navigation links
        this.navLinks.forEach(link => link.classList.remove('active'));
        clickedLink.classList.add('active');

        // Show corresponding content section
        const targetId = clickedLink.getAttribute('href').substring(1);
        this.contentSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetId) {
                section.classList.add('active');
            }
        });
    }

    handleStartDetection() {
        this.startBtn.disabled = true;
        this.stopBtn.disabled = false;
        // Event will be handled by app.js
        document.dispatchEvent(new CustomEvent('startDetection'));
    }

    handleStopDetection() {
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        // Event will be handled by app.js
        document.dispatchEvent(new CustomEvent('stopDetection'));
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    updateHistoryView(sessions) {
        this.historyList.innerHTML = '';

        sessions.forEach(session => {
            const sessionElement = this.createSessionElement(session);
            this.historyList.appendChild(sessionElement);
        });

        this.updateHistoryChart(sessions);
    }

    initializeHistoryChart() {
        if (!this.historyChartCanvas) return;

        const ctx = this.historyChartCanvas.getContext('2d');
        this.historyChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Positive', 'Neutral', 'Negative'],
                datasets: [
                    {
                        label: 'Emotion Distribution',
                        backgroundColor: ['#2ecc71', '#f1c40f', '#e74c3c'],
                        data: []
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Overall Emotion Distribution Across All Sessions'
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
    }

    updateHistoryChart(sessions) {
        if (!this.historyChart) return;

        let totalPositive = 0;
        let totalNeutral = 0;
        let totalNegative = 0;

        sessions.forEach(session => {
            totalPositive += session.emotionSummary?.positive || 0;
            totalNeutral += session.emotionSummary?.neutral || 0;
            totalNegative += session.emotionSummary?.negative || 0;
        });

        this.historyChart.data.datasets[0].data = [totalPositive, totalNeutral, totalNegative];

        this.historyChart.update();
    }

    createSessionElement(session) {
        const element = document.createElement('div');
        element.className = 'session-card';
        element.dataset.sessionId = session.id;
        
        const startTime = new Date(session.startTime).toLocaleString();
        const endTime = session.endTime ? new Date(session.endTime).toLocaleString() : 'Ongoing';
        
        element.innerHTML = `
            <div class="session-header">
                <h3>Session ${session.id}</h3>
                <button class="delete-btn" data-session-id="${session.id}">×</button>
            </div>
            <div class="session-details">
                <p>Start: ${startTime}</p>
                <p>End: ${endTime}</p>
                <p>Total Score: ${session.totalScore || 0}</p>
            </div>
            <div class="session-summary">
                <p>Positive: ${session.emotionSummary?.positive || 0}</p>
                <p>Neutral: ${session.emotionSummary?.neutral || 0}</p>
                <p>Negative: ${session.emotionSummary?.negative || 0}</p>
            </div>
        `;

        // Add delete functionality
        const deleteBtn = element.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.dispatchEvent(new CustomEvent('deleteSession', {
                detail: { sessionId: session.id }
            }));
        });

        // Add click listener to navigate to session detail page
        element.addEventListener('click', () => {
            window.location.href = `/session-detail.html?sessionId=${session.id}`;
        });

        return element;
    }
}

// Export for use in other modules
window.UIController = UIController; 