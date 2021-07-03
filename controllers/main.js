const fetch = require('node-fetch');
const { json } = require('body-parser');

const Property = require('../models/property');

// exports.getIndex = (req, res, next) => {
// res.render('properties', {
//     // res.render('reservations/calendar', {
//         pageTitle: 'Property List',
//         path: '/',        
//         currentUser: req.userId
//     });
// };

// loads calendar for current month
// will need to add way to highlight unavailable dates
exports.getIndex = (req, res, next) => {
    // const cookie = req.cookies.JWT_TOKEN;
    // console.log(cookie);
    // this will need to reworked to dynamically create this array
    const images = ['images/landscape3.jpeg', '/images/2021-06-10EclipseFlybywm1066.jpeg', '/images/landscape2.jpeg', '/images/AuroraClouds_Boffelli_1080.jpeg', '/images/landscape1.jpeg']
    
    const propId = "60d407a452435a4be8d17391"; //req.params.propertyId;
    Property
        .findById(propId)
        .then(property => {
            property.imageUrls = images;
            res.render('users/property', {            
                pageTitle: 'Make a Reservation',
                path: '/',
                property: property,            
                currentUser: req.session.user,
                isAuthenticated: req.session.LoggedIn,
                edit: false,
                reservation: null
            });        
        })
        .catch(err => {
            err.statusCode = 500;
            next(err);    
        });    
}
  