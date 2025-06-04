class FaceDetector {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('overlay');
        this.ctx = this.canvas.getContext('2d');
        this.isDetecting = false;
        this.animationFrameId = null;
        this.emotionCallback = null;
        this.modelsLoaded = false;
    }

    async initialize() {
        try {
            console.log('Starting to load FaceAPI models...');
            
            // Load FaceAPI models
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
                faceapi.nets.faceExpressionNet.loadFromUri('/models'),
                faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
            ]);
            
            this.modelsLoaded = true;
            console.log('FaceAPI models loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading FaceAPI models:', error);
            this.modelsLoaded = false;
            throw new Error('Failed to load FaceAPI models. Please check if models are in the correct location.');
        }
    }

    async startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                } 
            });
            this.video.srcObject = stream;
            
            return new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    // Set video dimensions
                    this.video.width = this.video.videoWidth;
                    this.video.height = this.video.videoHeight;
                    
                    // Set canvas dimensions to match video
                    this.canvas.width = this.video.videoWidth;
                    this.canvas.height = this.video.videoHeight;
                    
                    console.log(`Video dimensions: ${this.video.videoWidth}x${this.video.videoHeight}`);
                    console.log(`Canvas dimensions: ${this.canvas.width}x${this.canvas.height}`);
                    resolve();
                };
            });
        } catch (error) {
            console.error('Error accessing camera:', error);
            throw new Error('Tidak dapat mengakses kamera. Pastikan kamera terhubung dan izin kamera telah diberikan.');
        }
    }

    startDetection(callback) {
        if (!this.modelsLoaded) {
            throw new Error('FaceAPI models not loaded');
        }

        this.emotionCallback = callback;
        this.isDetecting = true;

        this.video.addEventListener('play', () => {
            console.log('Video playing, starting processing loop...');
            this.startProcessingVideo();
        });
    }

    stopDetection() {
        this.isDetecting = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    startProcessingVideo() {
        if (!this.isDetecting) return;

        this.detectEmotion();
        this.animationFrameId = requestAnimationFrame(() => this.startProcessingVideo());
    }

    async detectEmotion() {
        try {
            if (this.video.readyState === 4) {
                const detections = await faceapi.detectAllFaces(
                    this.video,
                    new faceapi.SsdMobilenetv1Options({ minConfidence: 0.2 })
                ).withFaceLandmarks().withFaceExpressions();

                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                if (detections.length > 0) {
                    this.drawDetections(detections);
                    const dominantEmotion = this.getDominantEmotion(detections[0].expressions);
                    const score = this.calculateEmotionScore(dominantEmotion);
                    
                    if (this.emotionCallback) {
                        this.emotionCallback({
                            emotion: dominantEmotion,
                            score: score,
                            timestamp: new Date().toISOString()
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error detecting emotions:', error);
        }
    }

    drawDetections(detections) {
        const displaySize = { width: this.video.width, height: this.video.height };
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        
        faceapi.draw.drawDetections(this.canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(this.canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(this.canvas, resizedDetections, 0.5);
    }

    getDominantEmotion(expressions) {
        return Object.entries(expressions).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    }

    calculateEmotionScore(emotion) {
        const positiveEmotions = ['happy', 'surprised'];
        const negativeEmotions = ['sad', 'angry', 'disgusted', 'fearful'];
        
        if (positiveEmotions.includes(emotion)) return 1;
        if (negativeEmotions.includes(emotion)) return -1;
        return 0; // neutral
    }

    async stopCamera() {
        const stream = this.video.srcObject;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            this.video.srcObject = null;
        }
    }
}

window.FaceDetector = FaceDetector; 