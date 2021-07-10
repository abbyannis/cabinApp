const inventoryController = require('../controllers/inventory');
const isAuth = require('../middleware/is-auth');
const express = require('express');
const router = express.Router();

router.get('/inventory', inventoryController.getAdminProperties);
router.get('/inventory/:propertyId', inventoryController.getInventory);
router.get('/new-inventory/:propertyId', inventoryController.getNewInventory);
router.get('/update', inventoryController.getUserProperties);
router.get('/user-update/:propertyId', inventoryController.getUserInventory);

router.post('/inventory', inventoryController.addInventory);
router.post('/update', inventoryController.updateInventory);
router.post('/delete', inventoryController.deleteInventory);

module.exports = router;
