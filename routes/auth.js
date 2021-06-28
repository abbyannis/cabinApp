const authController = require('../controllers/auth');
const express = require('express');
const router = express.Router();


router.get('/invite/:inviteToken', authController.acceptInvite);

module.exports = router;