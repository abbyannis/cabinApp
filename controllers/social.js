const Photo = require('../models/social-post');
const { validationResult } = require('express-validator');

// get page to upload an image
exports.getAddPhoto = (req, res, next) => {
  res.render('social/add-post', {
    path: '/add-post',
    pageTitle: 'Add Photo',
    isAuthenticated: req.session.isLoggedIn
  });
};

// post new photo
exports.postPhoto = (req, res, next) => {
  const image = req.file;
  const description = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('social/add-post', {
      path: '/add-post',
      pageTitle: 'Add Photo',
      editing: false,
      hasError: true,
      photo: {
        description: description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const imageUrl = image.path;

  const newImage = new Photo({
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  });
  newImage
    .save()
    .then(result => {
      res.redirect('add-post');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}