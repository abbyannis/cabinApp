const Inventory = require('../models/inventory');
const Cabin = require('../models/property');

exports.getInventory = (req, res, next) => {
  const propertyId = req.params.propertyId
  console.log(propertyId);
  Inventory.findOne({
      propertyId: propertyId
    })
    .then(inventory => {
      // if (!inventory) {
      //   res.render('')
      // }
      console.log(inventory)
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

  const propertyId = "60d407a452435a4be8d17391" // req.params.propertyId;
  const updateinventoryList = req.body.inventory;
  const updateAmount = req.body.amount;
  const newInventory = {
    item: {
      description: updateinventoryList,
      amount: updateAmount
    }
  }
  Inventory.findOne({
      propertyId: propertyId
    })
    .then(inventory => {
      console.log("in add!! " + inventory)
      if (!inventory) {
        res.redirect('/')
      } else {
        const inventoryList = new Array(inventory.list)
        inventoryList.push(newInventory)
        inventory.list = inventoryList
        console.log("inventoryList: " + inventoryList)
        // const inv = new Inventory({
        //   list: newInventory,
        //   propertyId: "60d407a452435a4be8d17391"
        // });
        inventory.save()
          .then(result => {
            console.log('Inventory Updated');
            res.redirect('/inventory/inventory')
          })
      }
    })
    .catch(err => {
      console.log(err);
    });
};

exports.updateInventory = (req, res, next) => {
  const count = req.body.updatedInventory;
  const list = req.body.list;
  console.log(count);
  // for(let i = 0; i < count; i++) {
  //   const updateAmount = req.body.i;
  //   console.log(updateAmount);
  // }
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

exports.getAdminProperties = (req, res, next) => {
  Cabin
    .find({
      admins: req.session.user._id
    })
    .then(properties => {
      // if 0 or more than 1 property, route to properties page for selection
      // this will need to route to a page for the admin to edit the property
      if (properties.length !== 1) {
        console.log('isAdmin = true')
        res.render('properties', {
          pageTitle: 'Property List',
          path: '/properties',
          currentUser: req.session.user._id,
          isAdmin: true,
          isAuthenticated: req.session.isLoggedIn,
          properties: properties,
          inventory: true
        });
      } else {
        // if only one property, automatically route to add reservation page
        // will need to be updated with correct route after routes set up
        res.redirect('/');
      }

    })
};