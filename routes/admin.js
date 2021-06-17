const adminController = require('../controllers/admin');
const express = require('express');
const router = express.Router();

//get a single admin property
router.get('/properties/:propertyId', adminController.getProperty);

//get all admin properties
router.get('/properties', adminController.getProperties);

//post a new property
router.post('/properties', adminController.postProperty);

//update an existing property
router.put('/properties/:propertyId', adminController.updateProperty);

//remove a property
router.delete('/properties/:propertyId', adminController.deleteProperty);

module.exports = router;