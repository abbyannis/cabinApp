const Photo = require('../models/social-post');

// get all photos
exports.getPhotos = (req, res, next) => {
    Photo.find()
    .then(photos => {
        res.render('social/add-post' , { 
            photos: photos,
            pageTitle: 'All Photos',
            path: '/photos',
            currentUser: req.userId
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};


// get single photo
exports.getPhoto = (req, res, next) => {
    const photoId = req.params.photoId;
    Photo.findById(photoId)
    .then(photo => {
        res.render('', { // TODO:
            photo: photo,
            pageTitle: photo.title,
            path: '/photos/:photoId',
            currentUser: req.userId
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};


// add photo to gallery
exports.postAddPhoto = (req, res, next) => {
    const image = req.file;
    const description = req.body.description;
    if (!image) {
      return res.status(422).render('/add-photo', {
        pageTitle: 'Add Photo',
        path: '/add-photo',
        editing: false,
        hasError: true,
        photo: {
          description: description
        },
        errorMessage: 'Attached file is not an image.',
        validationErrors: []
      });
    }
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).render('admin/add-photo', {
        pageTitle: 'Add Photo',
        path: '/admin/add-photo',
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
  
    const photo = new Photo({
      description: description,
      imageUrl: imageUrl,
      user: req.userId
    });
    photo
      .save()
      .then(result => {
        res.redirect('/admin/photos');
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  };