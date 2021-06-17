const reservationController = require('../controllers/reservation');
const express = require('express');
const router = express.Router();

//get by reservation id
router.get('/:reservationId', reservationController.getReservation)

//get all reservations for a single property
router.get('/list/:propertyId', reservationController.getReservations);

//post a new reservation
router.post('/:propertyId', reservationController.postReservation);

//update an existing reservation (date and/or comments)
router.put('/:reservationId', reservationController.modifyReservation);

//update the approval status of a reservation request
router.put('/approval/:reservationId', reservationController.approveReservation);

//remove a reservation from the system
router.delete('/:reservationId', reservationController.deleteReservation);

//get all reservations for a single user
router.get('/', reservationController.getUserReservations);

module.exports = router;