const mainController = require('../controllers/main');
const express = require('express');
const router = express.Router();
const isUser = require('../middleware/current-user');

router.get('/', isUser, mainController.getIndex);

module.exports = router;