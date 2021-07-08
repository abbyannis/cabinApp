const Inventory = require('../models/inventory');

exports.getInventory = (req, res, next) => {
  console.log("in get inventory");
    Inventory.find()
    .then(inventory => {
        res.render('inventory/inventory', {
            inventory: inventory,
            pageTitle: 'Inventory',
            path: '/inventory/inventory'
        })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.addInventory = (req, res, next) => {
    const updateinventoryList = req.body.inventory;
    const updateAmount = req.body.amount;
    const inventoryList = new Inventory({
        inventory: updateinventoryList,
        amount: updateAmount
    });
    inventoryList
        .save()
        .then(result => {
            console.log('Inventory Updated');
            res.redirect('/inventory/inventory') 
        })
        .catch(err => {console.log(err);});
};

exports.updateInventory = (req, res, next) => {
  const count = req.body.count;
  const list = req.body.list;
  console.log("in update inventory list = " + list);
  for(let i = 0; i < count; i++) {
    const updateAmount = req.body.i;
    console.log(updateAmount);
  }
  // const inventoryList = new Inventory({
  //     inventory: updateinventoryList,
  //     amount: updateAmount
  // });
  // inventoryList
  //     .save()
  //     .then(result => {
  //         console.log('Inventory Updated');
  //         res.redirect('/inventory/inventory') 
  //     })
  //     .catch(err => {console.log(err);});
};