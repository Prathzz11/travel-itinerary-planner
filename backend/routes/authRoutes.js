const express = require('express');
const router = express.Router();
const { signup, login, getMe, updateMe, logViewedTemplate } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.get('/users/:id', require('../controllers/authController').getPublicProfile);
router.post('/signup', signup);
router.post('/login', login);
router.put('/me/password', protect, require('../controllers/authController').changePassword);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.post('/me/viewed/:id', protect, logViewedTemplate);

module.exports = router;
