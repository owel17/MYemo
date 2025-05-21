# EmoBoy - Emotion Detection Web Application

EmoBoy is a web application that detects emotions from facial expressions using your device's camera. It tracks emotions in real-time and provides visual feedback through charts and historical data.

## Features

- Real-time emotion detection using FaceAPI.js
- Emotion categorization (Positive, Neutral, Negative)
- Real-time emotion tracking with Chart.js
- Session history with local storage
- MongoDB integration for persistent storage
- Responsive UI with collapsible sidebar
- Modular architecture for easy maintenance

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Modern web browser with camera access

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/emoboy.git
cd emoboy
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/emotion_tracker
```

4. Download FaceAPI.js models:
   - Create a `models` directory in `public/`
   - Download the required models from [FaceAPI.js models](https://github.com/justadudewhohacks/face-api.js/tree/master/weights)
   - Place the model files in the `public/models` directory

## Running the Application

1. Start MongoDB (if running locally):
```bash
mongod
```

2. Start the application:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

```
emotion-detector-app/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML file
│   ├── styles/            # CSS files
│   ├── js/                # Frontend JavaScript
│   └── models/            # FaceAPI.js models
├── server/                # Backend files
│   ├── server.js         # Express server
│   ├── routes/           # API routes
│   ├── controllers/      # Route controllers
│   └── models/           # MongoDB models
└── package.json          # Project dependencies
```

## Frontend JavaScript Files

Here's a breakdown of the main JavaScript files in the `public/js/` directory:

### `app.js`

This is the main entry point for the frontend application. It initializes the core components and sets up global event listeners.

- **`App` Class:**
    - `constructor()`: Initializes instances of `FaceDetector`, `ChartManager`, `StorageManager`, and `UIController`, then calls `initializeApp`.
    - `initializeApp()`: An asynchronous method that initializes FaceAPI models, starts the camera, loads history, and sets up event listeners.
    - `setupEventListeners()`: Configures event listeners for UI elements like the start/stop detection buttons, dispatching custom events that other components listen for.
    - `loadHistory()`: Retrieves session history from `StorageManager` and updates the UI via `UIController`.

### `faceDetector.js`

Manages camera access, FaceAPI model loading, and real-time face and emotion detection.

- **`FaceDetector` Class:**
    - `constructor()`: Sets up references to video and canvas elements and initializes internal state.
    - `initialize()`: Asynchronously loads the required FaceAPI models from the '/models' directory.
    - `startCamera()`: Asynchronously requests camera access and sets the video stream as the source for the video element. It also sets canvas dimensions based on video size after metadata is loaded.
    - `startDetection(callback)`: Starts the real-time detection process using `requestAnimationFrame` after the video starts playing. It takes a callback function to handle detected emotion data.
    - `stopDetection()`: Stops the real-time detection loop.
    - `startProcessingVideo()`: The recursive function called by `requestAnimationFrame` to process each video frame.
    - `detectEmotion()`: Asynchronously performs face detection, landmark detection, and expression analysis using FaceAPI. It draws the results on the canvas and calls the `emotionCallback` with the dominant emotion and score.
    - `drawDetections(detections)`: Draws bounding boxes, landmarks, and expression data on the canvas.
    - `getDominantEmotion(expressions)`: Determines the dominant emotion from the FaceAPI expression scores.
    - `calculateEmotionScore(emotion)`: Assigns a numerical score (1, 0, or -1) based on the dominant emotion.
    - `stopCamera()`: Stops the camera stream.

### `chartManager.js`

Handles the initialization and updating of the emotion tracking chart using Chart.js.

- **`ChartManager` Class:**
    - `constructor()`: Initializes the chart data structure and calls `initializeChart`.
    - `initializeChart()`: Gets the canvas context and creates a new Chart.js instance with predefined options for displaying emotion scores over time.
    - `addDataPoint(emotionData)`: Adds a new data point (timestamp and emotion score) to the chart and updates the chart display.
    - `clearChart()`: Resets the chart data.
    - `getChartData()`: Returns the current chart data.

### `storageManager.js`

Manages the storage of emotion detection session data.

- **`StorageManager` Class:**
    - `constructor()`: Initializes session data structures, potentially loading from local storage.
    - `saveEmotionData(emotionData)`: Saves individual emotion data points to the current session.
    - `endSession()`: Finalizes the current session, adds it to the history, and potentially saves to local storage.
    - `getAllSessions()`: Retrieves all saved sessions.
    - `deleteSession(sessionId)`: Deletes a specific session from storage.
    - `saveToMongoDB(sessionData)`: (Commented out/Future implementation) Placeholder for saving session data to a MongoDB backend via an API call.

### `uiController.js`

Controls the user interface elements and their interactions.

- **`UIController` Class:**
    - `constructor()`: Sets up references to UI elements like the sidebar and content sections.
    - `toggleSidebar()`: Toggles the visibility of the sidebar.
    - `showSection(sectionId)`: Displays the content section corresponding to the given ID and hides others.
    - `updateHistoryView(sessions)`: Renders the list of past detection sessions in the history section.
    - `showNotification(message, type)`: Displays temporary notifications to the user (e.g., for initialization status or errors).

## Usage

1. Allow camera access when prompted
2. Click "Start Detection" to begin emotion tracking
3. The application will detect emotions every 5 seconds
4. View real-time emotion data in the chart
5. Click "Stop Detection" to end the session
6. View session history in the "Riwayat Deteksi" section

## API Endpoints

- `GET /api/tracking` - Get all sessions
- `GET /api/tracking/stats` - Get session statistics
- `GET /api/tracking/:id` - Get a specific session
- `POST /api/tracking` - Create a new session
- `DELETE /api/tracking/:id` - Delete a session

## Troubleshooting and Fixes

This section outlines some common issues encountered during development and their resolutions.

### `Uncaught ReferenceError: exports is not defined`

This error typically indicates a conflict arising from loading JavaScript modules or libraries in ways not intended for the browser environment, often due to duplicate script includes (e.g., loading a library from a CDN in the `<head>` and a local file in the `<body>` with different module systems). In this project, the initial setup had duplicate includes which caused this error. Although the error persists in the current configuration, keeping the specific script includes was prioritized as it resolved camera visibility issues for some users. For a cleaner console, ensure libraries are only loaded once from a single source.

### `ReferenceError: faceapi is not defined`

This error occurs when the FaceAPI.js library is not available when the application code attempts to use it (specifically, when loading models). This was resolved by ensuring the main application initialization (`App.initializeApp`) waits for all page resources, including external scripts from the CDN, to be fully loaded by changing the event listener in `public/js/app.js` from `DOMContentLoaded` to `load`.

### "No face detected" and No Overlay

If the camera is visible but FaceAPI fails to detect a face, leading to no overlay and the "No face detected" log message, consider the following:

1.  **Environment Conditions:** Poor lighting, unusual face angles, or distance from the camera can hinder detection. Ensure good, even lighting and face the camera directly.
2.  **Detector Sensitivity:** The default detector options might be too strict. We improved detection by switching from `TinyFaceDetector` to `SSD_Mobilenetv1` in `public/js/faceDetector.js` and adjusting its `minConfidence` option to a lower value (e.g., 0.2). Experimenting with this value based on your camera and lighting conditions may help.
3.  **Real-time Loop:** Ensure the detection loop (`requestAnimationFrame`) is correctly initiated. We refined the logic in `public/js/faceDetector.js` to start the real-time processing loop (`startProcessingVideo`) triggered by the video's `play` event, ensuring processing begins reliably when the video stream is active.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [FaceAPI.js](https://github.com/justadudewhohacks/face-api.js) for face detection
- [Chart.js](https://www.chartjs.org/) for data visualization
- [Express.js](https://expressjs.com/) for the backend framework
- [MongoDB](https://www.mongodb.com/) for database 