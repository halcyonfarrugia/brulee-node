const express = require('express');
const router = express.Router();
const { register } = require('../controllers/user/register');
const { verify } = require('../controllers/user/verify');
const { login } = require('../controllers/user/login');
const { refresh } = require('../controllers/user/refresh');
const { logout } = require('../controllers/user/logout');

// Login route
router.post('/login', login);

// Logout route
router.post('/logout', logout);

// Refresh route
router.post('/refresh', refresh);

// Register route
router.post('/register', register);

// Verify route
router.get('/verify', verify);

module.exports = router;

