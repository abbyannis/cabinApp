const Cabin = require('../models/property');

//gets all properties for the current user
exports.getUserProperties = (req, res, next) => {
  Cabin
      .find({ 
        members: req.session.user._id
      })
      .then(properties => {
        // if 0 or more than 1 property, route to properties page for selection
        if(properties.length !== 1) {
          res.render('properties', {
            pageTitle: 'Property List',
            path: '/',        
            currentUser: req.session.user._id,
            isAdmin: false,
            properties: properties
          });
        } else {
          // if only one property, automatically route to add reservation page
          // will need to be updated with correct route after routes set up
          res.redirect('../main/calendar/' + properties[0]._id);
        }
        
      })
}

//gets all properties for the current user
// exports.getProperties = (req, res, next) => {  
//   try {    
//     Cabin
//       .find({ 
//         members: req.session.user._id //"60d5468cfd36781a9cb65077"
//       })  
//       .then(properties => {           
//         res.status(200).json({ properties });          
//       })      
//       .catch(err => {
//         const error = new Error(err);
//         error.statusCode = 500;
//         next(error);
//       });   
//   } catch(err) {    
//     const error = new Error(err);
//     error.statusCode = 500;
//     throw(error);
//   }  
// };