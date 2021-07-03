const Cabin = require('../models/property');
const User = require('../models/user');
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
        if(properties.length !== 1) {
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
          res.redirect('../main/calendar/' + properties[0]._id);
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
  const userId = req.userId;
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
  Cabin.getPropertyById(req.params.propertyId, req.userId)
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
