const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');

const User = require('../models/user');
const { restart } = require('nodemon');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: process.env.API_KEY 
    } 
 }));
 
exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: "",
    //  userType: req.session.userType,
        currentUser: req.userId,
        oldInput: {
            email: '',
            password: ''
        },
        validationErrors: []
    });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: "",
        currentUser: req.userId,
        oldInput: {
            first: "",
            last: "", 
            email: "", 
            display: "",
            phone: "",
            password: "", 
            confirmPassword: "" 
        },
        validationErrors: []
    });
};

exports.getReset = (req, res, next) => {
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: "",
        // userType: req.session.userType,
        currentUser: req.userId
    });
};
 
exports.getProfile = (req, res, next) => {
    let message = req.flash('notification');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('pages/proveAssignments/prove06/auth/edit-profile', {
        path: '/edit-profile',
        pageTitle: 'Edit Profile',
        errorMessage: "",
        message: message,
        userType: req.session.userType,
        currentUser: req.session.user,
        oldInput: {
            first: req.session.user.first,
            last: req.session.user.last, 
            email: req.session.user.email, 
            password: "", 
            confirmPassword: "" 
        },
        validationErrors: []
    });
};

exports.getUpdatePassword = (req, res, next) => {
    const userId = req.session.user._id;
    console.log(userId);
    User.findOne(userId)
        .then(user => {
            let message = req.flash('notification');
            if (message.length > 0) {
                message = message[0];
            } else {
                message = null;
            }
            
            res.render('pages/proveAssignments/prove06/auth/update-password', {
                path: '/update-password',
                pageTitle: 'Update Password',
                errorMessage: "",
                message: message,
                userType: req.session.userType,
                currentUser: req.session.user,
                password: "",
                confirmPassword: "",
                userId: userId, 
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
        .then(user => {
            let message = req.flash('error');
            console.log(message);
            if (message.length > 0) {
                message = message[0];
            } else {
                message = null;
            }
            res.render('pages/proveAssignments/prove06/auth/new-password', {
                path: '/new-password',
                pageTitle: 'New Password',
                errorMessage: message,
                userType: req.session.userType,
                currentUser: req.session.user,
                userId: user._id.toString(), 
                passwordToken: token
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('pages/proveAssignments/prove06/auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg,
            userType: req.session.userType,
            currentUser: req.session.user,
            oldInput: {
                email: email,
                password: password
            },
            validationErrors: errors.array()
        });
    }
    User.findOne({email: email})
        .then(user => {
            if (!user) {
                return res.status(422).render('pages/proveAssignments/prove06/auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    errorMessage: 'Invalid email or password',
                    userType: req.session.userType,
                    currentUser: req.session.user,
                    oldInput: {
                        email: email,
                        password: password
                    },
                    validationErrors: []
                });
            }
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.userType = user.userType;
                        req.session.user = user;
                        return req.session.save((err) => {
                            console.log(err);
                            res.redirect('/proveAssignments/06/');
                        });   
                    }
                    return res.status(422).render('pages/proveAssignments/prove06/auth/login', {
                        path: '/login',
                        pageTitle: 'Login',
                        errorMessage: 'Invalid email or password',
                        userType: req.session.userType,
                        currentUser: req.session.user,
                        oldInput: {
                            email: email,
                            password: password
                        },
                        validationErrors: []
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/proveAssignments/06/auth/login');
            })
            
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/proveAssignments/06');
    });
};

exports.postSignup = (req, res, next) => {
    const first = req.body.first;
    const last = req.body.last;
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('pages/proveAssignments/prove06/auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
            currentUser: req.session.user,
            oldInput: { 
                first: req.body.first,
                last: req.body.last,
                email: email, 
                password: password, 
                confirmPassword: req.body.confirmPassword 
            },
            validationErrors: errors.array()
        });
    }
    
    bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                first: first,
                last: last,
                email: email,
                password: hashedPassword,
                userType: 'admin',
                cart: { items: [] }
            });
            return user.save();
        })
        .then(result => {
            res.redirect('/proveAssignments/06/auth/login');
            return transporter.sendMail({
                to: email,
                from: 'abbygannis@gmail.com',
                subject: 'The Shop Registration Successful',
                html: '<p>Dear ' + first + ',</p>' +
                    '<p>Thank your for registering with The Shop!</p>' +
                    '<p>Sincerely,</p>' +
                    '<p> The Shop Staff</p>'
            });
        })  
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({email: req.body.email})
            .then(user => {
                if (!user) {
                    req.flash('error', 'No account found.');
                    return res.redirect('/proveAssignments/06/auth/reset');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000; // expires in 1 hour
                return user.save();
            })
            .then(result => {
                res.redirect('/proveAssignments/06');
                transporter.sendMail({
                    to: req.body.email,
                    from: 'abbygannis@gmail.com',
                    subject: 'Password Reset',
                    html: `
                        <p>You requested a password reset</p>
                        <p>Click this <a href="http://localhost:5000/proveAssignments/06/auth/reset/${token}">link</a> to set a new password.</p>
                    `
                });
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    });
};

exports.postUpdateProfile = (req, res, next) => {
    const first = req.body.first;
    const last = req.body.last;
    const email = req.body.email;
    const userId = req.body.userId;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('pages/proveAssignments/prove06/auth/edit-profile', {
            path: '/edit-profile',
            pageTitle: 'Edit Profile',
            errorMessage: errors.array()[0].msg,
            message: "",
            userType: req.session.user.userType,
            currentUser: req.session.user,
            oldInput: { 
                first: first,
                last: last,
                email: email, 
                password: "", 
                confirmPassword: "" 
            },
            validationErrors: errors.array()
        });
    }
    User.findById(userId).then(user => {
        console.log(user);
        user.first = first;
        req.session.user.first = first;
        user.last = last;
        req.session.user.last = last;
        user.email = email;
        req.session.user.email = email;
        console.log(req.session.user.email);
        console.log(email);
        return user.save()
    })  
    .then(result => {
        req.flash('notification', 'Profile Updated');
        res.redirect('../../../../proveAssignments/06/auth/edit-profile');
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.postUpdatePassword = (req, res, next) => {
    const newPassword = req.body.password;
    const newConfirmPassword = req.body.confirmPassword;
    const userId = req.body.userId;
    let resetUser;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('pages/proveAssignments/prove06/auth/update-password', {
            path: '/update-password',
            pageTitle: 'UpdatePassword',
            errorMessage: errors.array()[0].msg,
            message: "",
            userType: req.session.userType,
            currentUser: req.session.user,
            password: newPassword,
            confirmPassword: newConfirmPassword,
            userId: userId,
            validationErrors: errors.array()
        });
    }
    User.findById(userId)
    .then(user => {
        resetUser = user;
        return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
        resetUser.password = hashedPassword;
        return resetUser.save();
    })  
    .then(result => {
        req.flash('notification', 'Password Updated');
        res.redirect('/proveAssignments/06/auth/update-password');
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({
        resetToken: passwordToken, 
        resetTokenExpiration: {$gt: Date.now()}, 
        _id: userId
    })
    .then(user => {
        resetUser = user;
        return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
        resetUser.password = hashedPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
    })  
    .then(result => {
        res.redirect('/proveAssignments/06/auth/login');
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};