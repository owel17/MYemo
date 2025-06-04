const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Routes untuk User Profile
router.post('/profiles', userController.createProfile);
router.get('/profiles/:id', userController.getProfile);
router.put('/profiles/:id', userController.updateProfile);
router.delete('/profiles/:id', userController.deleteProfile);
router.get('/profiles/:userId/match-emotion', userController.matchUsersBasedOnEmotion);

module.exports = router; 