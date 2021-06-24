const authController = require('../controllers/auth');
const express = require('express');
const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.get('/reset', authController.getReset);

module.exports = router;