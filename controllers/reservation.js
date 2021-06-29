const Reservation = require('../models/reservation');
const utils = require('../util/utilities');
const { validationResult } = require("express-validator");
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ACCOUNT, 
    pass: process.env.EMAIL_PWD
  }
});

//find all reservations for the specified property (id in params)
//with a start date <= qeury.endDate 
exports.getReservations = (req, res, next) => {
  try {       
    let startDay = new Date(req.query.startDate);
    let endDay = new Date(req.query.endDate);        
    if(utils.isValidDate(startDay) && utils.isValidDate(endDay)) {          
      Reservation
        .find({ 
          property: req.params.propertyId,
          $or:[
            { startDate: { $gte: startDay, $lte: endDay } }, 
            { endDate: { $gte: startDay, $lte: endDay } }
          ]   
        })  
        .then(reservations => {                               
          res.status(200).json({ reservations });          
        })    
        .catch(err => {
          console.log(err);
          const error = new Error(err);
          error.statusCode = 500;
          next(error);
        });   
    } else {      
        console.log("here");
        const error = new Error("Invalid Date Format");
        error.statusCode = 400;
        throw(error);
    }
  } catch(err) {
    console.log(err);
    const error = new Error(err);
    error.statusCode = 500;
    throw(error);
  }
};

//get reservationby a specific reservationId (in params)
exports.getReservation = (req, res, next) => {        
  Reservation.getReservationById(req.params.reservationId)  
  .then(reservation => {          
      res.status(200).json({ reservation });          
  })    
  .catch(err => {
    const error = new Error(err);
    error.statusCode = 500;
    next(error);
  });   
};

//get all reservations for a user 
exports.getUserReservations = (req, res, next) => {      
  Reservation
    .find({ user: req.userId })   
    .then(reservations => {          
        res.status(200).json({ reservations });          
    })    
    .catch(err => {
      const error = new Error(err);
      error.statusCode = 500;
      next(error);
    });   
};

//Add a new reservation
exports.postReservation = (req, res, next) => {   
  //check validation in middleware for valid fields
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).json( { errors }); 
  } 
  //check if dates are valid (not reserved and shorter max length but longer than min) in validation.
  const startDate = new Date(req.body.startDate);
  const endDate = new Date(req.body.endDate);
  const user = req.userId;
  const property = req.params.propertyId;  
  Reservation.CheckDateAvailability(startDate, endDate, property)
  .then(availability => {    
    //if valid, create:
    if (!availability) {
      return res.status(409).json({ reservation: null, message: "No availability during selected time." });
    }     
    let reservation = new Reservation({
      user: user,
      property: property,
      comments: req.body.comments,
      status: "pending",
      startDate: startDate,
      endDate: endDate
    });    
    reservation    
      .save()
      .then(result => {
        return res.status(201).json({ reservation: result, message: "Reservation submitted." });
      });
    })          
    .catch(err => {      
      if (!err.statusCode) err.statusCode = 500;
      next(err);    
    });
};

//Modifies reservation dates based on request body
exports.modifyReservation = (req, res, next) => {  
  //check validation in middleware for valid fields
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).json( { errors });
  }   
  const startDate = new Date(req.body.startDate);
  const endDate = new Date(req.body.endDate);
  const user = req.userId;
  const property = req.params.propertyId;     
  Reservation.getReservationById(req.params.reservationId) 
  .then(reservation => {    
    if(reservation.user.toString() !== user) {             
      const error = new Error("Unauthorized attempt to modify a reservation.");
      error.statusCode = 401;
      throw error;
    }     
    //check if dates are valid (not reserved and shorter max length but longer than min) in validation.
    Reservation.CheckDateAvailability(startDate, endDate, property, user)
    .then(availability => {    
      //if valid, create:
      console.log(availability);    
      if (!availability) {
        return res.status(409).json({ reservation: null, message: "No availability during selected time." });
      }       
      //if valid, update:      
      reservation.startDate = startDate;
      reservation.endDate = endDate;
      reservation.comments = req.body.comments;
      reservation.status = 'pending';
      return reservation.save();
    })    
    .then(result => {
      res.status(200).json({ 
        message: 'Reservation has been modified.', 
        reservation: result
      });
    }); 
  })     
  .catch(err => {    
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  });
};

//Approves or rejects(and deletes) a reservation based on the reservationId in the params
exports.approveReservation = (req, res, next) => {    
  const status = req.body.status;
  let myReservation;
  Reservation.findById(req.params.reservationId)
    .populate('user')
    .populate('property')
    .then(reservation => {
      if(!reservation) {
        const err = new Error('Reservation not found');
        err.statusCode = 404;
        throw error;
      }
      myReservation = reservation;         
      if (status === 'confirmed') {
        reservation.status = status;        
        return reservation.save();
      } else if (req.body.status === 'declined') {
        return Reservation.findByIdAndRemove(req.params.reservationId);
      } else {
        const error = new Error("Invalid reservation status received.");
        error.statusCode = 422;
        throw error;
      } 
    })    
    .then(result => {
      //send result      
      res.status(200).json({ 
        message: `Your reservation has been ${status}.`, 
        reservation: result
      });
      //notify user of status
      transporter.sendMail({
        to: myReservation.user.email,
        from: 'reservations@atTheCabin.com',
        subject: `Your reservation request has been ${status}`,
        html: `<p>Your reservation request for property ${myReservation.property.name}, ${myReservation.property.location} has been ${status} for the following dates:
        ${myReservation.startDate.toLocaleDateString()} to ${myReservation.endDate.toLocaleDateString()}.`        
      });
    })    
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

//Removes a reservation from the table based on the reservationId in the params
exports.deleteReservation = (req, res, next) => {   
  Reservation.getReservationById(req.params.reservationId) 
  .then(reservation => {     
    if(reservation.user.toString() !== req.userId.toString()) {     
      console.log("h1");   
      const err = new Error("Unauthorized attempt to modify a reservation.");
      err.statusCode = 401;
      throw err;
    }     
    return Reservation.findByIdAndRemove(req.params.reservationId);
  })
  .then(result => {    
    res.status(200).json({ message: 'Reservation has been canceled.'});
  })
  .catch(err => {
    console.log(err);
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  });
};

