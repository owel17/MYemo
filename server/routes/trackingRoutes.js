const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');

// Get all sessions
router.get('/', trackingController.getAllSessions);

// Get session statistics
router.get('/stats', trackingController.getStatistics);

// Get a single session by ID
router.get('/:id', trackingController.getSessionById);

// Create a new session
router.post('/', trackingController.createSession);

// Delete a session
router.delete('/:id', trackingController.deleteSession);

module.exports = router; 