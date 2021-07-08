const inventoryController = require('../controllers/inventory');
const isAuth = require('../middleware/is-auth');
const express = require('express');
const router = express.Router();

router.get('/inventory', inventoryController.getInventory);
router.post('/inventory', inventoryController.addInventory);
router.post('/update', inventoryController.updateInventory);

module.exports = router;
