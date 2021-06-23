const Reservation = require('../models/reservation');
const Property = require('../models/property');
const User = require('../models/user');
const utils = require('../util/utilities');


function getReservationById(req) {  
  return Reservation     
    .findById(req.params.reservationId)
    .then(reservation => {
      if (!reservation) {
        const err = new Error('Reservation not found');
        err.statusCode = 404;
        throw error;
      }            
      return reservation;
    });    
}

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
  getReservationById(req)  
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
  //check validation in middleware for valid dates

  //ensure user is authorized to post to this property

  let reservation = new Reservation({
    user: req.userId,
    property: req.body.propertyId,
    comments: req.body.comments,
    status: "pending",
    startDate: new Date(req.body.startDate),
    endDate: new Date(req.body.endDate)
  });
  reservation
    .save()
    .then(result => {
      return res.status(201).json({reservation: result});
    })
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);    
    });
};

//Modifies reservation dates based on request body
exports.modifyReservation = (req, res, next) => {  
  getReservationById(req)
  .then(reservation => {
      if(reservation.user.toString() !== req.userId.toString()) {        
        const error = new Error("Unauthorized attempt to modify a reservation.");
        error.statusCode = 401;
        throw error;
      }
      //check if dates are valid (not reserved and shorter max length but longer than min) in validation.

      //if not valid, return error
      
      //if valid, update:
      reservation.startDate = req.body.startDate;
      reservation.endDate = req.body.startDate;
      reservation.comments = req.body.comments;
      reservation.status = 'pending';
      return reservation.save();
    })
    .then(result => {
      res.status(200).json({ 
        message: 'Reservation has been modified.', 
        reservation: result
      });
    })
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

//Approves or rejects(and deletes) a reservation based on the reservationId in the params
exports.approveReservation = (req, res, next) => {  
   getReservationById(req)
    .then(reservation => {
      if (req.body.status === 'confirmed') {
        reservation.status = req.body.status;
        return reservation.save();
      } else if (req.body.status === 'rejected') {
        return Reservation.findByIdAndRemove(req.params.reservationId);
      } else {
        const error = new Error("Invalid reservation status received.");
        error.statusCode = 400;
        throw error;
      } 
    })    
    .then(result => {
      //send result
      res.status(200).json({ 
        message: `Reservation has been ${req.body.status}.`, 
        reservation: result
      });
    })    
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

//Removes a reservation from the table based on the reservationId in the params
exports.deleteReservation = (req, res, next) => {
  getReservationById(req)
  .then(reservation => {
    if(reservation.user.toString() !== req.userId.toString()) {        
      const error = new Error("Unauthorized attempt to modify a reservation.");
      error.statusCode = 401;
      throw error;
    }
    return Reservation.findByIdAndRemove(req.params.reservationId);
  })
  .then(result => {
    res.status(200).json({ message: 'Reservation has been canceled.'});
  })
  .catch(err => {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  });
};

