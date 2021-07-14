const Checklist = require('../models/checklist');
const Cabin = require('../models/property');

exports.getChecklist = (req, res, next) => {
    const propertyId = req.query.propertyId;
    const listId = req.query.listId;
    Checklist.findById(listId)
      .then(checklist => {
        Cabin.findById(propertyId)
        .then(property => {
          res.render('checklist/checklist', {
            checklist: checklist,
            pageTitle: 'Checklist',
            path: '/checklist/checklist',
            propertyId: propertyId,
            name: property.name,
            location: property.location,
            listId: listId
          })
        })
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };

  exports.getLists = (req, res, next) => {
    const propertyId = req.params.propertyId; 
    const title = req.body.title; // check this body name
    let updateDesc = req.body.description;
  
    Checklist.find({
        propertyId: propertyId
      })
      .then(checklist => {

        console.log(checklist)
        Cabin.findById(propertyId)
            .then(property => {
                return res.render('checklist/new-checklist', {
                    pageTitle: 'Property Checklists',
                    path: '/checklist/new-checklist',
                    propertyId: propertyId,
                    name: property.name,
                    location: property.location,
                    checklist: checklist
                  });
            })
        // if (!checklist) {
        //   const inv = new Checklist({
        //     title: 'Property Checklists',
        //     path: '/checklist/new-checklist',
        //     list: [{title: title}],
        //     propertyId: propertyId
        //   })
        // } else {
        //   checklist.list.push({title: title});
        //   return checklist.save()
        //   .then(result => {
        //     return res.redirect('/checklist/checklist/' + propertyId);
        //   })
        //}
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };

  exports.addChecklist = (req, res, next) => {
    const propertyId = req.body.propertyId; 
    const title = req.body.title; 
  
    if (!title) {
        return res.redirect('/checklist/new-checklist/' + propertyId)
    }
    
          const check = new Checklist({
            list: [],
            propertyId: propertyId,
            title: title
          })
          check.save()
          .then(result => {
            return res.redirect('/checklist/new-checklist/' + propertyId);
          }) 
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };

  exports.addTask = (req, res, next) => {
    const propertyId = req.body.propertyId; 
    const listId = req.body.listId;
    let updateDesc = req.body.description;
  
    if (!updateDesc) {
        return res.redirect('/checklist/checklist/' + "?listId=" + listId + "&propertyId=" + propertyId)
    }
    Checklist.findOne({
        propertyId: propertyId
      })
      .then(checklist => {
        if (!checklist) {
          const check = new Checklist({
            list: [{description: updateDesc}],
            propertyId: propertyId
          })
          check.save();
          return res.redirect('/checklist/checklist/' + "?listId=" + listId + "&propertyId=" + propertyId);
        } else {
          checklist.list.push({description: updateDesc});
          return checklist.save()
          .then(result => {
            return res.redirect('/checklist/checklist/' + "?listId=" + listId + "&propertyId=" + propertyId);
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

    //Deletes a checklist
    exports.deleteChecklist = (req, res, next) => {
        const propertyId = req.query.propertyId; 
        const listId = req.query.listId;
        Checklist.deleteOne({'_id': listId})
        .then(result => {
            return res.redirect('/checklist/new-checklist/' + propertyId);
        })
                
    };
    

  //Deletes items from checklist
  exports.deleteChecklistItem = (req, res, next) => {
    const propertyId = req.query.propertyId; 
    const itemToDelete = req.query.itemId;
    const listId = req.query.listId;
    console.log(itemToDelete)
    Checklist.findOne({
        propertyId: propertyId
      })
      .then(checklist => {
        var index
        for (i = 0; i < checklist.list.length; i++) {
          if (checklist.list[i]._id == itemToDelete) {
              index = i
          }
        }
        if (index > -1) {
          checklist.list.splice(index, 1);
        }
        return checklist.save()
          .then(result => {
            return res.redirect('/checklist/checklist/' + "?listId=" + listId + "&propertyId=" + propertyId);
          })
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };

  //Add new tasks to the checklist
  exports.updateChecklist = (req, res, next) => {
    const description = req.body.description;
    const itemId = req.body.itemId;
    const listId = req.body.listId;
    const propertyId = req.body.propertyId;
    const newList = [];
    if (Array.isArray(description)) {
      for(let i = 0; i < description.length; i++) {
        newList.push({   
          description: description[i],
          _id: itemId[i]
        })
      }
    } else {
      newList.push({   
        description: description,
        _id: itemId
      })
    }
    Checklist.findOne({ propertyId: propertyId })
      .then(checklist => {
        checklist.list = newList;
        return checklist.save()
        .then(results => {
          return res.redirect('/checklist/checklist/?listId=' + listId + '&propertyId=' + propertyId);
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
    const address = '/checklist/checklist/'
    Cabin
      .find({
        admins: req.session.user._id
      })
      .then(properties => {
        // if 0 or more than 1 property, route to properties page for selection
        // this will need to route to a page for the admin to edit the property
        if (properties.length !== 1) {
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
          res.redirect('../checklist/checklist/' + properties[0]._id);
        }
  
      })
  };

  exports.getUserChecklist = (req, res, next) => {
    const propertyId = req.params.propertyId;
    Checklist.find({'propertyId': propertyId})
      .then(checklist => {
          console.log(checklist)
        Cabin.findById(propertyId)
        .then(property => {
          res.render('checklist/checklist-user', {
            checklist: checklist,
            pageTitle: 'Checklist',
            path: '/checklist/checklist-user',
            propertyId: propertyId,
            name: property.name,
            location: property.location
          })
        })
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };

  exports.getUserProperties = (req, res, next) => {
    const address = '/checklist/checklist-user/' 
    Cabin
        .find({ 
          $or: [{members: req.session.user._id},
            { admins: req.session.user._id }]
        })
        .then(properties => {
          // if 0 or more than 1 property, route to properties page for selection
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
            res.redirect('../checklist/checklist-user/' + properties[0]._id);
          }
          
        })
      .catch(err => {
          const error = new Error(err);
          error.statusCode = 500;
          next(error);
      }); 
  }
  