const mainController = require('../controllers/main');
const express = require('express');
const router = express.Router();

router.get('/', mainController.getIndex);

module.exports = router;