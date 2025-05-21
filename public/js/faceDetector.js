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
            
            // Removed: Set canvas dimensions here - will set after video metadata is loaded in startCamera
            // this.canvas.width = this.video.width;
            // this.canvas.height = this.video.height;
            
            return true;
        } catch (error) {
            console.error('Error loading FaceAPI models:', error);
            this.modelsLoaded = false;
            throw new Error('Failed to load FaceAPI models. Please check if models are in the correct location.');
        }
    }

    async startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.video.srcObject = stream;
            return new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    // Set canvas dimensions here, after video metadata is loaded
                    this.canvas.width = this.video.videoWidth; // Use videoWidth/videoHeight for intrinsic size
                    this.canvas.height = this.video.videoHeight;
                    console.log(`Video dimensions: ${this.video.videoWidth}x${this.video.videoHeight}`);
                    console.log(`Canvas dimensions: ${this.canvas.width}x${this.canvas.height}`);
                    resolve();
                };
            });
        } catch (error) {
            console.error('Error accessing camera:', error);
            throw error;
        }
    }

    startDetection(callback) {
        if (!this.modelsLoaded) {
            throw new Error('FaceAPI models not loaded');
        }

        this.emotionCallback = callback;
        this.isDetecting = true;

        // Start the first detection frame - Removed, loop will start on video play
        // this.detectEmotion();

        // Add event listener for video play to start the loop
        this.video.addEventListener('play', () => {
             console.log('Video playing, starting processing loop...');
             this.startProcessingVideo();
         });
    }

    stopDetection() {
        this.isDetecting = false;

        // Cancel animation frame
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    // New function to start the processing loop
    startProcessingVideo() {
        if (!this.isDetecting) return; // Stop loop if detection is cancelled

        // Call the detection function for the current frame
        this.detectEmotion();

        // Schedule the next frame processing
        this.animationFrameId = requestAnimationFrame(() => this.startProcessingVideo());
    }

    async detectEmotion() {
        // if (!this.isDetecting) return; // Removed: Check handled by startProcessingVideo

        try {
            // Ensure video has dimensions (no need to check .playing here, loop starts on play)
            if (this.video.readyState === 4) {
                const detections = await faceapi.detectAllFaces(
                    this.video,
                    new faceapi.SsdMobilenetv1Options({ minConfidence: 0.2 })
                ).withFaceLandmarks().withFaceExpressions();

                // Clear canvas before drawing
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                if (detections.length > 0) {
                    // Draw detections
                    this.drawDetections(detections);

                    // Get dominant emotion
                    const dominantEmotion = this.getDominantEmotion(detections[0].expressions);
                    const score = this.calculateEmotionScore(dominantEmotion);
                    
                    console.log('Detected emotion:', dominantEmotion, 'Score:', score);

                    if (this.emotionCallback) {
                        this.emotionCallback({
                            emotion: dominantEmotion,
                            score: score,
                            timestamp: new Date().toISOString()
                        });
                    }
                } else {
                    console.log('No face detected');
                }
            }
        } catch (error) {
            console.error('Error detecting emotions:', error);
        }

        // Removed: Schedule the next frame detection here
        // if (this.isDetecting) {
        //      this.animationFrameId = requestAnimationFrame(() => this.detectEmotion());
        // }
    }

    drawDetections(detections) {
        // Draw face detection box
        faceapi.draw.drawDetections(this.canvas, detections);
        
        // Draw face landmarks
        faceapi.draw.drawFaceLandmarks(this.canvas, detections);
        
        // Draw face expressions
        faceapi.draw.drawFaceExpressions(this.canvas, detections, 0.5);
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

// Export for use in other modules
window.FaceDetector = FaceDetector; 