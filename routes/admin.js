const adminController = require('../controllers/admin');
const express = require('express');
const router = express.Router();

//get all admin properties
router.get('/properties/:userId', adminController.getProperties)

//post a new reservation
router.post('/properties/:userId', adminController.postProperty);

module.exports = router;