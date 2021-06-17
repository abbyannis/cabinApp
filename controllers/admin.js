const Property = require('../models/Property');
const User = require('../models/User');

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