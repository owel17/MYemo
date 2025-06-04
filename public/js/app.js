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
            
            this.uiController.showNotification('Aplikasi berhasil diinisialisasi', 'success');
        } catch (error) {
            console.error('Error initializing app:', error);
            this.uiController.showNotification(error.message || 'Terjadi kesalahan saat menginisialisasi aplikasi', 'error');
        }
    }

    setupEventListeners() {
        const startButton = document.getElementById('startDetection');
        const stopButton = document.getElementById('stopDetection');

        if (!startButton || !stopButton) {
            console.error('Required buttons not found');
            return;
        }

        // Start detection
        startButton.addEventListener('click', async () => {
            try {
                this.faceDetector.startDetection((emotionData) => {
                    this.chartManager.addDataPoint(emotionData);
                    this.storageManager.saveEmotionData(emotionData);
                });
                startButton.disabled = true;
                stopButton.disabled = false;
            } catch (error) {
                console.error('Error starting detection:', error);
                this.uiController.showNotification('Gagal memulai deteksi', 'error');
            }
        });

        // Stop detection
        stopButton.addEventListener('click', () => {
            try {
                this.faceDetector.stopDetection();
                const sessionData = this.storageManager.endSession();
                this.chartManager.clearChart();
                
                startButton.disabled = false;
                stopButton.disabled = true;
                
                this.loadHistory();
            } catch (error) {
                console.error('Error stopping detection:', error);
                this.uiController.showNotification('Gagal menghentikan deteksi', 'error');
            }
        });

        // Delete session
        document.addEventListener('deleteSession', (event) => {
            try {
                const { sessionId } = event.detail;
                this.storageManager.deleteSession(sessionId);
                this.loadHistory();
            } catch (error) {
                console.error('Error deleting session:', error);
                this.uiController.showNotification('Gagal menghapus sesi', 'error');
            }
        });

        // End session on page unload
        window.addEventListener('beforeunload', () => {
            try {
                this.storageManager.endSession();
                this.faceDetector.stopCamera();
            } catch (error) {
                console.error('Error cleaning up:', error);
            }
        });
    }

    loadHistory() {
        try {
            const sessions = this.storageManager.getAllSessions();
            this.uiController.updateHistoryView(sessions);
        } catch (error) {
            console.error('Error loading history:', error);
            this.uiController.showNotification('Gagal memuat riwayat', 'error');
        }
    }
}

// Initialize app when DOM is loaded
window.addEventListener('load', () => {
    try {
        window.app = new App();
    } catch (error) {
        console.error('Error creating app instance:', error);
        alert('Terjadi kesalahan saat memulai aplikasi. Silakan muat ulang halaman.');
    }
}); 