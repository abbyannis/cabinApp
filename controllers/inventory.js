const Inventory = require('../models/inventory');
const Cabin = require('../models/property');

exports.getInventory = (req, res, next) => {
  const propertyId = req.params.propertyId
  Inventory.findOne({
      propertyId: propertyId
    })
    .then(inventory => {
      if (!inventory) {
        return res.redirect('/inventory/new-inventory/' + propertyId)
      }
      res.render('inventory/inventory', {
        inventory: inventory,
        pageTitle: 'Inventory',
        path: '/inventory/inventory',
        propertyId: propertyId
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getUserInventory = (req, res, next) => {
  const propertyId = req.params.propertyId
  Inventory.findOne({
      propertyId: propertyId
    })
    .then(inventory => {
      res.render('inventory/inventory-user', {
        inventory: inventory,
        pageTitle: 'Inventory',
        path: '/inventory/inventory',
        propertyId: propertyId
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}

exports.getNewInventory = (req, res, next) => {
  const propertyId = req.params.propertyId
  res.render('inventory/new-inventory', {
    inventory: [],
    pageTitle: 'Inventory',
    path: '/inventory/inventory',
    propertyId: propertyId
  })
}

exports.addInventory = (req, res, next) => {
  const propertyId = req.body.propertyId; 
  const updateinventoryList = req.body.inventory;
  let updateAmount = req.body.amount;

  if (!updateinventoryList) {
    return res.redirect('/inventory/inventory/' + propertyId)
  }
  if (!updateAmount) {
    updateAmount = 0;
  }
  Inventory.findOne({
      propertyId: propertyId
    })
    .then(inventory => {
      if (!inventory) {
        const inv = new Inventory({
          list: [{description: updateinventoryList, amount: updateAmount }],
          propertyId: propertyId
        })
        inv.save();
        return res.redirect('/inventory/inventory/' + propertyId);
      } else {
        inventory.list.push({description: updateinventoryList, amount: updateAmount });
        return inventory.save()
        .then(result => {
          return res.redirect('/inventory/inventory/' + propertyId);
        })
      }
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteInventory = (req, res, next) => {
  console.log("we made it to delete!")
  const propertyId = req.query.propertyId; 
  const itemToDelete = req.query.itemId;
  console.log(itemToDelete)
  Inventory.findOne({
      propertyId: propertyId
    })
    .then(inventory => {
      var index
      for (i = 0; i < inventory.list.length; i++) {
        if (inventory.list[i]._id == itemToDelete) {
            index = i
        }
      }
      if (index > -1) {
        inventory.list.splice(index, 1);
      }
      console.log("right after " + index)
      return inventory.save()
        .then(result => {
          return res.redirect('/inventory/inventory/' + propertyId);
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
  const item = req.body.item;
  const amount = req.body.amount;
  const itemId = req.body.itemId;
  const propertyId = req.body.propertyId;
  const list = [];
  for(let i = 0; i < item.length; i++) {
    list.push({ 
      description: item[i],
      amount: amount[i],
      _id: itemId[i]
    })
  }
  Inventory.findOne({ propertyId: propertyId })
    .then(inventory => {
      inventory.list = list;
      return inventory.save()
      .then(results => {
        return res.redirect('/inventory/inventory/' + propertyId);
      })
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

exports.getAdminProperties = (req, res, next) => {
  const address = '/inventory/inventory/'
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
          address: address
        });
      } else {
        // if only one property, automatically route to add reservation page
        // will need to be updated with correct route after routes set up
        res.redirect('../inventory/inventory/' + properties[0]._id);
      }

    })
};

exports.getUserProperties = (req, res, next) => {
  const address = '/inventory/user-update/' 
  Cabin
      .find({ 
        members: req.session.user._id
      })
      .then(properties => {
        // if 0 or more than 1 property, route to properties page for selection
        console.log('made it here')
        if(properties.length !== 1) {
          res.render('properties', {
            pageTitle: 'Property List',
            path: '/',        
            currentUser: req.session.user._id,
            isAdmin: false,
            isAuthenticated: req.session.isLoggedIn,
            properties: properties,
            address: address
          });
        } else {
          // if only one property, automatically route to add reservation page
          // will need to be updated with correct route after routes set up
          res.redirect('../inventory/user-update/' + properties[0]._id);
        }
        
      })
    .catch(err => {
        const error = new Error(err);
        error.statusCode = 500;
        next(error);
    }); 
}