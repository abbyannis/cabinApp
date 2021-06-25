const reservationController = require('../controllers/reservation');
const propUser = require('../middleware/is-property-user');
const express = require('express');
const utils = require('../util/utilities');
const { body } = require('express-validator');
const router = express.Router();

//get by reservation id (in query)
router.get('/:propertyId/:reservationId', propUser, reservationController.getReservation)

//remove a reservation from the system
router.delete('/:propertyId/:reservationId', propUser, reservationController.deleteReservation);

//get all reservations for a single property
router.get('/list/:propertyId', propUser, reservationController.getReservations);

//post a new reservation
router.post('/:propertyId', propUser,
  [
    body('startDate')
      .custom((value, {req}) => {
        if(!utils.isValidDate(new Date(req.body.startDate))) {
          throw new Error('Specified start date is an invalid format');
        }
        return true;
      }),
    body('endDate')
      .custom((value, {req}) => {
        if(!utils.isValidDate(new Date(req.body.endDate))) {
          throw new Error('Specified end date is an invalid format');
        }
        return true;
      })
  ], 
  reservationController.postReservation);

//update an existing reservation (date and/or comments)
router.patch('/:propertyId/:reservationId', propUser,
  [
    body('startDate')
      .custom((value, {req}) => {
        if(!utils.isValidDate(new Date(req.body.startDate))) {
          throw new Error('Specified start date is an invalid format');
        }
        return true;
      }),
    body('endDate')
      .custom((value, {req}) => {
        if(!utils.isValidDate(new Date(req.body.endDate))) {
          throw new Error('Specified end date is an invalid format');
        }
        return true;
      })
  ], 
  reservationController.modifyReservation);

//update the approval status of a reservation request
router.patch('/:propertyId/approval/:reservationId', propUser, reservationController.approveReservation);

//get all reservations for a single user
router.get('/', reservationController.getUserReservations);

module.exports = router;