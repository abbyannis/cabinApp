const adminController = require('../controllers/admin');
const express = require('express');
const { body } = require('express-validator');
const isAdmin = require('../middleware/is-admin');
const router = express.Router();

//get a single admin property
router.get('/properties/:propertyId', adminController.getProperty);

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
  adminController.updateProperty);

//remove a property
router.delete('/properties/:propertyId', adminController.deleteProperty);

//invite a new user to a property
router.post('/properties/:propertyId/invite', 
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address.')
      .normalizeEmail()      
  ], adminController.inviteUser);

//remove a user from a property
router.delete('/properties/:propertyId/remove/:userId', adminController.removeUser);

//Loads initial checklist page
router.get('/edit-checklist/:checklistId', adminController.getChecklist);

router.get('/add-checklist/:propertyId', adminController.createChecklist);

//Loads checklists linked to a property
router.get('/checklist/:propertyId', adminController.getPropertyChecklist);

//Endpoint returning checklists as JSON
router.get('/checklist', adminController.getChecklistJSON);

//Endpoint to edit the checklist
router.post('/edit-checklist/:checklistId', adminController.postEditChecklist);

module.exports = router;