const Inventory = require('../models/inventory');

exports.getInventory = (req, res, next) => {
    Inventory.find({ propertyId: req.property._id})
    .then(item => {
      if (!item) {
        const error = new Error('Item not found.');
        error.statusCode = 404;
        throw error;
      }
        console.log(tasks);
        res.render('items/inventory', {
            tasks: tasks,
            pageTitle: 'Inventory',
            path: '/items/inventory'
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