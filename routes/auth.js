const express = require('express');
const { check, body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');
const isAuth = require('../middleware/is-auth');
const isUser = require('../middleware/current-user');

const router = express.Router();

router.get('/login', isUser, authController.getLogin);

router.get('/signup', isUser, authController.getSignup);

router.get('/edit-profile', isAuth, authController.getProfile);

router.get('/update-password', isAuth, authController.getUpdatePassword);

router.get('/reset', isUser, authController.getReset);

router.get('/reset/:token', isUser, authController.getNewPassword);

router.post('/login',
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email')
            .normalizeEmail(),
        body(
            'password',
            'Password must be at least 8 characters with at least 1 lowercase, 1 uppercase, and 1 special character'
        )
            .isStrongPassword({ 
                minLength: 8, 
                minLowercase: 1, 
                minUppercase: 0, 
                minNumbers: 0, 
                minSymbols: 0, 
                returnScore: false })
            .trim()
    ], 
authController.postLogin);

router.post('/logout', isAuth, authController.postLogout);

router.post('/signup',
    [ 
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email')
            .normalizeEmail()
            .custom((value, { req }) => {
                return User.findOne({ email: value })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('Email exists already. Please choose a different email.');
                    }
            });
        }),
        body(
            'password',
            'Password must be at least 8 characters with at least 1 lowercase, 1 uppercase, and 1 special character'
        )
            .isStrongPassword({ 
                minLength: 8, 
                minLowercase: 1, 
                minUppercase: 0, 
                minNumbers: 0, 
                minSymbols: 0, 
                returnScore: false })
            .trim(),
        body('confirmPassword')
            .trim()
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords do not match');
                }
                return true;
            }),
        body('first')
            .isLength({ min: 1 })
            .withMessage('First Name Required'),
        body('last')
            .isLength({ min: 1 })
            .withMessage('Last Name Required'),
        body('display')
            .isLength({ min: 1 })
            .withMessage('Display Name Required'),
        body('phone')
            .whitelist('0123456789')
            .isMobilePhone('en-US', true)
            .withMessage('Please enter a valid phone number'),
    ], 
authController.postSignup);

router.post('/edit-profile', 
    isAuth,
    [ 
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email')
            .normalizeEmail(),
        body('first')
            .isLength({ min: 1 })
            .withMessage('First name required'),
        body('last')
            .isLength({ min: 1 })
            .withMessage('Last name required')   
    ],
authController.postUpdateProfile);

router.post('/new-password', 
    [ 
        body(
            'password',
            'Password must be at least 8 characters with at least 1 lowercase, 1 uppercase, and 1 special character'
        )
            .isStrongPassword({ 
                minLength: 8, 
                minLowercase: 1, 
                minUppercase: 0, 
                minNumbers: 0, 
                minSymbols: 0, 
                returnScore: false })
            .trim()
    ],
authController.postNewPassword);

router.post('/update-password',
    isAuth,
    [ 
        body(
            'password',
            'Password must be at least 8 characters with at least 1 lowercase, 1 uppercase, and 1 special character'
        )
            .isStrongPassword({ 
                minLength: 8, 
                minLowercase: 1, 
                minUppercase: 0, 
                minNumbers: 0, 
                minSymbols: 0, 
                returnScore: false })
            .trim(),
        body('confirmPassword')
            .trim()
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords do not match');
                }
                return true;
            }) 
    ],
authController.postUpdatePassword);

router.post('/reset', authController.postReset);

router.get('/invite/:inviteToken', authController.acceptInvite);

module.exports = router;