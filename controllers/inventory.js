const Inventory = require('../models/inventory');

exports.getInventory = (req, res, next) => {
    Inventory.fetchAll()
    .then(inventory => {
        res.render('inventory/inventory', {
            inven: Inventory,
            pageTitle: 'Inventory',
            path: '/'
        })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updateInventory = (req, res, next) => {
    const updateinventoryList = req.params.inventory;
    const inventoryList = new inventoryList({
        userInventory = updateinventoryList,
        itemId = req.item
    });
    inventoryList
        .save()
        .then(result => {
            console.log('Inventory Updated');
            res.redirect('/main') 
        })
        .catch(err => {console.log(err);});
};