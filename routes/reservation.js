const reservationController = require('../controllers/reservation');
const express = require('express');
const router = express.Router();

//get by reservation id
router.get('/:reservationId', reservationController.getReservation)

//get all reservations for a single property
router.get('/list/:propertyId', reservationController.getReservations);

//post a new reservation
router.post('/:propertyId', reservationController.postReservation);

module.exports = router;