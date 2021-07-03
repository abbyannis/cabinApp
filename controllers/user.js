const Cabin = require('../models/property');

//gets all properties for the current user
exports.getProperties = (req, res, next) => {  
  try {    
    Cabin
      .find({ 
        members: req.userId //"60d5468cfd36781a9cb65077"
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
    const error = new Error(err);
    error.statusCode = 500;
    throw(error);
  }  
};

