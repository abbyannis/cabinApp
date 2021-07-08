const socialController = require('../controllers/social');
const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/is-auth');

//get photo upload page
router.get('/add-post', isAuth, socialController.getAddPhoto);

// post new photo
router.post('/postPhoto', isAuth, socialController.postPhoto)

// //get all photos
// router.get('/photos', socialController.getPhotos);

// //get single photo
// router.get('/:photoId', socialController.getPhoto);

module.exports = router;