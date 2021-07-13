const Cabin = require('../models/property');
const User = require('../models/user');
const ChecklistMaster = require('../models/checklist-master');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const ROOTURL = process.env.HEROKU_ORIGIN || "http://localhost:5000";
const { validationResult } = require("express-validator");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ACCOUNT, 
    pass: process.env.EMAIL_PWD
  }
});

// open property list for admins
exports.getAdminProperties = (req, res, next) => {
  Cabin
      .find({ 
        admins: req.session.user._id
      })
      .then(properties => {
        // if 0 or more than 1 property, route to properties page for selection
        // this will need to route to a page for the admin to edit the property
        if(properties.length !== 1) {
          console.log('isAdmin = true')
          res.render('properties', {
            pageTitle: 'Property List',
            path: '/properties',        
            currentUser: req.session.user._id,
            isAdmin: true,
            properties: properties
          });
        } else {
          // if only one property, automatically route to add reservation page
          // will need to be updated with correct route after routes set up
          res.redirect('../main/dashboard/' + properties[0]._id);
        }
        
      })
}

//get properties managed by this user
exports.getProperties = (req, res, next) => {        
  try {    
    Cabin
      .find({ 
        admins: req.userId     
      })  
      .then(properties => {                               
        res.status(200).json({ properties });          
      })      
      .catch(err => {
        const error = new Error(err);
        error.statusCode = 500;
        next(error);
      });   
  } catch(err) {
    console.log(err);
    const error = new Error(err);
    error.statusCode = 500;
    throw(error);
  }  
};

//create a new property
exports.postProperty = (req, res, next) => {        
  //check validation in middleware for valid fields
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).json( { errors });
  }
  let cabin = new Cabin({
    name: req.body.name,
    location: req.body.location,
    admins: [req.userId],
    members: [],
    imageUrls: req.body.imageUrls || []
  });  
  cabin
    .save()
    .then(result => {
      return res.status(201).json({cabin: result});
    })
    .catch(err => {  
      console.log(err);         
      if (!err.statusCode) err.statusCode = 500;
      next(err);    
    });
};


//fetch a property by the property id
exports.getProperty = (req, res, next) => {
  Cabin.getPropertyById(req.params.propertyId, req.userId)
  .then(cabin => {
    res.status(200).json({ cabin });
  })
  .catch(err => {
    const error = new Error(err);
    error.statusCode = 500;
    next(error);
  });
};

//updates an existing property
exports.updateProperty = (req, res, next) => {        
  //check validation in middleware for valid fields    
  const errors = validationResult(req);     
  if(!errors.isEmpty()) {
    return res.status(422).json( { errors });  
  } 
  Cabin.getPropertyById(req.params.propertyId, req.userId)
  .then(cabin => {
    cabin.name = req.body.name;
    cabin.location = req.body.location;  
    //this imageUrls bit probably needs some work
    cabin.imageUrls = req.body.imageUrls;       
    return cabin.save();
  })
  .then(result => {    
    res.status(200).json({
      message: 'Property has been updated.',
      cabin: result
    });
  })
  .catch(err => {
    console.log(err);
    if (!err.statusCode) err.statusCode = 500;
    next(err);    
  });
};

//remove a property
exports.deleteProperty = (req, res, next) => {
  Cabin.getPropertyById(req.params.propertyId, req.userId)
  .then(cabin => {    
    const idx = cabin.admins.indexOf(req.userId);
    console.log(idx);
    if(idx > -1) {
      cabin.admins.splice(idx, 1);
    }
    if (cabin.admins.length > 0) { //update
      return cabin.save();        
    } else { //no admins left, so delete
      return Cabin.findByIdAndDelete(cabin._id);
    }
  })
  .then(result => {
    res.status(200).json({ message: 'Property removed from your profile.' });
  })
  .catch(err => {
    if (!err.statusCode) err.statusCode = 500;
    next(err);    
  });
}

//invite a new user
exports.inviteUser = (req, res, next) => {
  //ensure valid inputs through validation  
  const pId = req.params.propertyId;
  const userId = req.session.user._id;
  const email = req.body.email;
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).json( { errors });
  }
  crypto.randomBytes(32, (err, buffer) => {
    if(err) {
      throw err;      
    }    
    const token = buffer.toString('hex');
    let propertyName;
    let userName;        
    Cabin.getPropertyById(pId, userId)
    .then(cabin => {      
      propertyName = cabin.name;
      cabin.invites.push(token);      
      return cabin.save();
    })
    .then(result => {      
      return User.findById(userId);
    })
    .then(user => {      
      if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw error;
      }      
      userName = `${user.firstName} ${user.lastName}`;            
      res.status(200).json({ message: "Invitation sent."});
      //send email to specified address with a new invite token      
      transporter.sendMail({
        to: email,
        from: 'invites@atTheCabin.com',
        subject: `${userName} invites you to their cabin.'`,
        html: `<p>${userName} has invited you to join their group on 
        <a href='${ROOTURL}'>@theCabin</a> for their property entitled
        ${propertyName}. <br><a href='${ROOTURL}auth/invite/${token}'>Click here to accept their invitation</a>.</p>`
      });      
    })
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);    
    });        
  });
}

//remove a user from the property
exports.removeUser = (req, res, next) => {
  Cabin.getPropertyById(req.params.propertyId, req.session.user._id)
  .then(cabin => {
    const idx = cabin.members.indexOf(req.params.userId);
    if(idx > -1) {
      cabin.members.splice(idx, 1);      
    } 
    return cabin.save();
  })
  .then(result => {
    res.status(200).json({
      message: 'Property has been updated.',
      cabin: result
    });
  })
  .catch(err => {
    if (!err.statusCode) err.statusCode = 500;
    next(err);   
  });
}

//add an invited user to the property
exports.addUser = (req, res, next) => {
  const token = req.params.inviteToken;  
  Cabin 
  .findOne({ 
    invites: token      
  })
  .then(cabin => {
    if (!cabin) {    
      const err = new Error('Property not found');
      err.statusCode = 404;
      throw error;
    }              
    cabin.members.push(req.params.newUserId);  
    const idx = cabin.invites.indexOf(token); //remove token
    console.log(idx);          
    if(idx > -1) {
      cabin.invites.splice(idx, 1);      
    }  
    return cabin.save();
  })
  .then(result => {
    res.status(200).json({
      message: 'User added to property.',
      cabin: result
    });
  })
  .catch(err => {
    if (!err.statusCode) err.statusCode = 500;
    next(err);   
  });
}

//checklist auth

exports.postAddChecklist = (req, res, next) => {
  const title = req.body.title;
  const description = req.body.description;
  res.render('admin/edit-checklist', {
      pageTitle: 'Add New Task',
      path: '/admin/edit-checklist',
      editing: false,
      isAuthenticated: req.session.LoggedIn,
      currentUser: req.session.user
  });
  const checklist = new ChecklistMaster({
      title: title, 
      description: description 
  });
  Cabin.getPropertyById(req.params.propertyId, req.userId)
    .save()
    .then(cabin => {
          cabin.checklist.push(checklist);
          console.log('New Task Created');
          res.redirect('/checklists/checklist')
      })
      .catch(err => {
          console.log(err);
      });

};

exports.getChecklist = (req, res, next) => {
  const editMode = req.query.edit;
  // if (!editMode) {
  //   return res.redirect('/');
  // }
  const propId = req.params.propertyId;
  Cabin.findById(propId)
    .then(checklist => {
      // if (!checklist) {
      //   return res.redirect('/');
      // }
      res.render('admin/edit-checklist', {
        pageTitle: 'Edit Checklist',
        path: '/admin/edit-checklist',
        currentUser: req.session.user,
        isAuthenticated: req.session.LoggedIn,
        editing: editMode
      });
    })
    .catch(err => console.log(err));
};

exports.getPropertyChecklist = (req, res, next) => {
  let propertyName;
  const propId = req.params.propertyId;
  Cabin.findById(propId)
    .then(property => {
      if (!property) {
        const error = new Error('Property not found');
        error.statusCode = 500;
        throw error;
      }
      return property.name;
    })
    .then( (propName) => {
      propertyName = propName;
      return ChecklistMaster.find({
        property: propId
      })
      .then(checklist => {
        console.log('1');
        // if (!checklist) {
        //   return res.redirect('/');
        // }
        res.render('admin/checklist-list', {
          pageTitle: 'Property Checklist',
          path: '/admin/edit-checklist',
          currentUser: req.session.user,
          isAuthenticated: req.session.LoggedIn,
          isAdmin: true,
          checklist: checklist,
          propertyName: propertyName,
          propertyId: propId
        });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })
};
exports.getChecklistJSON = (req, res, next) => {
  const editMode = req.query.edit;
  // if (!editMode) {
  //   return res.redirect('/');
  // }
  const propId = req.params.propertyId;
  Cabin.findById(propId)
    .then(checklist => {
      // if (!checklist) {
      //   return res.redirect('/');
      // }
      
    })
    .catch(err => console.log(err));
};

exports.createChecklist = (req, res, next) => {
  const propId = req.params.propertyId;
  Cabin.findById(propId)
    .then(checklist => {
      res.render('admin/edit-checklist', {
        pageTitle: 'Add New Checklist',
        path: '/admin/edit-checklist',
        isAuthenticated: req.session.LoggedIn,
        checklist: {
          listTitle: '',
          property: propId,
          task: []
        }
      })
      
    })
    .catch(err => console.log(err));
};

// save editied checklist
exports.postEditChecklist = (req, res, next) => {
  const propId = req.body.propertyId;
  const updatedTitle = req.body.title;
  const updatedDesc = req.body.description;
  
    res.status(422).render('admin/edit-checklist', {
      pageTitle: 'Edit Checklist',
      path: '/admin/edit-checklist',
      editing: true,
      currentUser: req.session.user,
      isAuthenticated: req.session.LoggedIn,
      checklist: {
        title: updatedTitle,
        description: updatedDesc,
        _id: propId
      }
    });
  Cabin.findById(propId)
    .then(checklist => {
      checklist.title = updatedTitle;
      checklist.description = updatedDesc;
      return checklist.save().then(result => {
        console.log('Checklist has been updated!');
        res.redirect('/admin/edit-chechlist');
      });
    })
    .catch(err => console.log(err));
};
