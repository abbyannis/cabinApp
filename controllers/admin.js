const Property = require('../models/Property');
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const ROOTURL = process.env.HEROKU_ORIGIN || "http://localhost:5000";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ACCOUNT, 
    pass: process.env.EMAIL_PWD
  }
});

//finds a property that matches the property id in the request parameters
// AND the user id (req.userId) is in the list of valid admins
function getPropertyById(req) {
  return Property 
    .find({ 
      _id: req.params.propertyId, 
      admins: req.userId
    })
    .then(result => {
      if (!result) {
        const err = new Error('Property not found');
        err.statusCode = 404;
        throw error;
      }      
      return result;
    });    
}


//get properties managed by this user
exports.getProperties = (req, res, next) => {        
  try {    
    Property
      .find({ 
        admins: req.params.userId     
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

  let property = new Property({
    name: req.body.name,
    location: req.body.location,
    admins: [req.params.userId],
    members: [],
    imageUrls: req.body.imageUrls
  });
  property
    .save()
    .then(result => {
      return res.status(201).json({property: result});
    })
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);    
    });
};


//fetch a property by the property id
exports.getProperty = (req, res, next) => {
  getPropertyById(req)
  .then(property => {
    res.status(200).json({ property });
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
  
  getPropertyById(req)
  .then(property => {
    property.name = req.body.name;
    property.location = req.body.location;  

    //this imageUrls bit probably needs some work
    property.imageUrls = req.body.imageUrls;


    return property.save();
  })
  .then(result => {
    res.status(200).json({
      message: 'Property has been updated.',
      property: result
    });
  })
  .catch(err => {
    if (!err.statusCode) err.statusCode = 500;
    next(err);    
  });
};

//remove a property
exports.deleteProperty = (req, res, next) => {
  getPropertyById(req)
  .then(property => {    
    const idx = property.admins.indexOf(req.userId);
    if(idx > -1) {
      property.admins.splice(idx, 1);
    }
    if (property.admins.length > 0) { //update
      return property.save();        
    } else { //no admins left, so delete
      return Property.findByIdAndDelete(property._id);
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
  crypto.randomBytes(32, (err, buffer) => {
    if(err) {
      throw err;      
    }
    const token = buffer.toString('hex');
    let propertyName;
    let userName;    
    getPropertyById(req)
    .then(property => {
      propertyName = property.name;
      property.invites.push(token);
      return property.save();
    })
    then(result => {
      return User.findById(req.userId);
    })
    .then(user => {
      if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw error;
      }
      userName = `${user.firstName} ${user.lastName}`;    
      //send email to specified address with a new invite token
      transporter.sendMail({
        to: req.body.email,
        from: 'invites@atTheCabin.com',
        subject: `${userName} invites you to their cabin.'`,
        html: `<p>${userName} has invited you to join their group on 
        <a href='${ROOTURL}'>@theCabin</a> for their property entitled
        ${propertyName}. <br><a href='${ROOTURL}/auth/invite/${token}'>Click here to accept their invitation</a>.</p>`
      })
    })
    .then(result => {
      res.status(200).json({ message: "Invitation sent."});
    });
  })
  .catch(err => {
    if (!err.statusCode) err.statusCode = 500;
    next(err);   
  });
}

//remove a user from the property
exports.removeUser = (req, res, next) => {
  getPropertyById(req)
  .then(property => {
    const idx = property.users.indexOf(req.params.userId);
    if(idx > -1) {
      property.users.splice(idx, 1);      
    } 
    return property.save();
  })
  .then(result => {
    res.status(200).json({
      message: 'Property has been updated.',
      property: result
    });
  })
  .catch(err => {
    if (!err.statusCode) err.statusCode = 500;
    next(err);   
  });
}

//add an invited user to the property
exports.addUser = (req, res, next) => {
  Property 
  .find({ 
    invites: req.params.inviteToken      
  })
  .then(property => {
    if (!property) {
      const err = new Error('Property not found');
      err.statusCode = 404;
      throw error;
    }      
    return result;
  })
  .then(property => {
    property.users.push(req.params.userId);  
    const idx = property.invites.indexOf(req.params.inviteToken); //remove token
    if(idx > -1) {
      property.invites.splice(idx, 1);      
    }  
    return property.save();
  })
  .then(result => {
    res.status(200).json({
      message: 'User added to property.',
      property: result
    });
  })
  .catch(err => {
    if (!err.statusCode) err.statusCode = 500;
    next(err);   
  });
}
