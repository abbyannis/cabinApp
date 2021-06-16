const reservationController = require('../controllers/reservation');
const express = require('express');
const router = express.Router();

//get by reservation id
router.get('/:reservationId', reservationController.getReservation)

//get all reservations for a single property
router.get('/all/:propertyId', reservationController.getReservations);



module.exports = router;