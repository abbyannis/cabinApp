const inventoryController = require('../controllers/inventory');
// const isAuth = require('../middleware/is-auth');
const express = require('express');
const router = express.Router();

router.get('/list', inventoryController.getInventory);

module.exports = router;
