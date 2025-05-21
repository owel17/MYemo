class App {
    constructor() {
        this.faceDetector = new FaceDetector();
        this.chartManager = new ChartManager();
        this.storageManager = new StorageManager();
        this.uiController = new UIController();

        this.initializeApp();
    }

    async initializeApp() {
        try {
            // Initialize FaceAPI
            await this.faceDetector.initialize();
            
            // Start camera
            await this.faceDetector.startCamera();
            
            // Load history
            this.loadHistory();
            
            // Set up event listeners
            this.setupEventListeners();
            
            this.uiController.showNotification('Application initialized successfully', 'success');
        } catch (error) {
            console.error('Error initializing app:', error);
            this.uiController.showNotification('Error initializing application', 'error');
        }
    }

    setupEventListeners() {
        // Start detection
        document.getElementById('startDetection').addEventListener('click', () => {
            this.faceDetector.startDetection((emotionData) => {
                this.chartManager.addDataPoint(emotionData);
                this.storageManager.saveEmotionData(emotionData);
            });
            document.getElementById('startDetection').disabled = true;
            document.getElementById('stopDetection').disabled = false;
        });

        // Stop detection
        document.getElementById('stopDetection').addEventListener('click', () => {
            this.faceDetector.stopDetection();
            const sessionData = this.storageManager.endSession();
            this.chartManager.clearChart();
            
            document.getElementById('startDetection').disabled = false;
            document.getElementById('stopDetection').disabled = true;
            
            this.loadHistory();
        });

        // Delete session
        document.addEventListener('deleteSession', (event) => {
            const { sessionId } = event.detail;
            this.storageManager.deleteSession(sessionId);
            this.loadHistory();
        });
    }

    loadHistory() {
        const sessions = this.storageManager.getAllSessions();
        this.uiController.updateHistoryView(sessions);
    }
}

// Initialize app when DOM is loaded
window.addEventListener('load', () => {
    window.app = new App();
}); 