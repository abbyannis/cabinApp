const adminController = require('../controllers/admin');
const express = require('express');
const { body } = require('express-validator');
const isAdmin = require('../middleware/is-admin');
const router = express.Router();

//get admin dashboard
router.get('/admin-index', isAdmin, adminController.getAdminDash)

//get create new property page
router.get('/property', adminController.getCreateProperty)

//get a single admin property
router.get('/properties/:propertyId', adminController.getProperty);

//manage reservations
router.get('/reservations', adminController.manageReservations);

//get all admin properties
router.get('/properties', adminController.getAdminProperties);

//post a new property
router.post('/properties', 
  [
    body('name', 'Property name must be between 3 and 20 characters')
      .isString()
      .trim()
      .isLength( { min: 3, max: 20 }),
    body('location', 'Property location must be between 3 and 20 characters')
      .isString()
      .trim()
      .isLength( { min: 3, max: 20 })
  ],
  adminController.postProperty);

//update an existing property
router.patch('/properties/:propertyId', 
  [
    body('name', 'Property name must be between 3 and 20 characters')
      .isString()
      .trim()
      .isLength( { min: 3, max: 20 }),
    body('location', 'Property location must be between 3 and 20 characters')
      .isString()
      .trim()
      .isLength( { min: 3, max: 20 })
  ],
  isAdmin, adminController.updateProperty);

//remove a property
router.delete('/properties/:propertyId', isAdmin, adminController.deleteProperty);

//invite a new user to a property
router.post('/properties/:propertyId/invite', 
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address.')
      .normalizeEmail()      
  ], isAdmin, adminController.inviteUser);

//remove a user from a property
router.delete('/properties/:propertyId/remove/:userId', isAdmin, adminController.removeUser);

//update the approval status of a reservation request
router.patch('/manage-reservation/:propertyId/:reservationId', isAdmin, adminController.manageReservation);


module.exports = router;