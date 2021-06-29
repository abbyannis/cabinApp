const socialController = require('../controllers/social');
const express = require('express');
const router = express.Router();

//post a new photo
router.post('/:photoId', socialController.postAddPhoto);

//get all photos
router.get('/photos', socialController.getPhotos);

//get single photo
router.get('/:photoId', socialController.getPhoto);

module.exports = router;