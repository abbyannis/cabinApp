const Property = require('../models/Property');
const User = require('../models/User');

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

  //ensure user is authorized/signed in

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