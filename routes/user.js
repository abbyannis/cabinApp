const userController = require('../controllers/user');
const isAuth = require('../middleware/is-auth');
const isUser = require('../middleware/is-property-user');

const express = require('express');
const router = express.Router();

//get all user properties
router.get('/properties', isAuth, isUser, userController.getProperties);

module.exports = router;