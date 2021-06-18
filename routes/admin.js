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

//invite a new user to a property
router.post('/properties/:propertyId/invite', adminController.inviteUser);

//add a user to a property
router.post('/properties/:propertyId/add/:inviteToken', adminController.addUser);

//remove a user from a property
router.delete('/properties/:propertyId/remove/:userId', adminController.removeUser);


module.exports = router;