const reservationController = require('../controllers/reservation');
const propUser = require('../middleware/is-property-user');
const express = require('express');
const router = express.Router();

//get by reservation id (in query)
router.get('/:propertyId/:reservationId', propUser, reservationController.getReservation)

//remove a reservation from the system
router.delete('/:propertyId/:reservationId', propUser, reservationController.deleteReservation);

//get all reservations for a single property
router.get('/list/:propertyId', propUser, reservationController.getReservations);

//post a new reservation
router.post('/:propertyId', propUser, reservationController.postReservation);

//update an existing reservation (date and/or comments)
router.put('/:propertyId/:reservationId', propUser, reservationController.modifyReservation);

//update the approval status of a reservation request
router.put('/:propertyId/approval/:reservationId', propUser, reservationController.approveReservation);

//get all reservations for a single user
router.get('/', reservationController.getUserReservations);

module.exports = router;