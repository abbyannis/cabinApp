const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Whitelist = require('../models/whitelist');
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
    // let message = req.flash('notification');
    // if (message.length > 0) {
    //     message = message[0];
    // } else {
    //     message = null;
    // }
    User.findById(req.userId)
        .then(user => {
            res.render('auth/edit-profile', {
                path: '/edit-profile',
                pageTitle: 'Edit Profile',
                errorMessage: "",
                message: "",
                // userType: req.session.userType,
                currentUser: user,
                oldInput: {
                    first: user.firstName,
                    last: user.lastName, 
                    email: user.email, 
                    password: "", 
                    confirmPassword: "" 
                },
                validationErrors: []
            });
        })
    
};

exports.getUpdatePassword = (req, res, next) => {
    const userId = req.userId;
    console.log(userId);
    User.findById(userId)
        .then(user => {
            // let message = req.flash('notification');
            // if (message.length > 0) {
            //     message = message[0];
            // } else {
            //     message = null;
            // }
            
            res.render('auth/update-password', {
                path: '/update-password',
                pageTitle: 'Update Password',
                errorMessage: "",
                message: "",
                // userType: req.session.userType,
                currentUser: user,
                password: "",
                confirmPassword: "",
                userId: userId, 
            });
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
        .then(user => {
            // let message = req.flash('error');
            // console.log(message);
            // if (message.length > 0) {
            //     message = message[0];
            // } else {
            //     message = null;
            // }
            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'New Password',
                errorMessage: "",
                // userType: req.session.userType,
                currentUser: req.userId,
                userId: user._id.toString(), 
                passwordToken: token
            });
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg,
            // userType: req.session.userType,
            currentUser: req.userId,
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
                return res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    errorMessage: 'Invalid email or password',
                    // userType: req.session.userType,
                    currentUser: req.userId,
                    oldInput: {
                        email: email,
                        password: password
                    },
                    validationErrors: []
                });
            }
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    const created = new Date().toISOString();
                    if (doMatch) {
                        const token = jwt.sign({
                            email: user.email, 
                            userId: user._id.toString()
                        }, 
                        process.env.TOKEN_SECRET, 
                        { expiresIn: '1hr' }
                        );
                        const whitelist = new Whitelist({
                            token: token,
                            createdAt: created
                        });
                        return whitelist.save()
                        .then(result => {
                            res.cookie("JWT_TOKEN", token, { 
                                maxAge: 3600000, 
                                httpOnly: true 
                            });
                            return res.redirect('/');
                        })
                        .catch(err => {
                            if(!err.statusCode) {
                                err.statusCode = 500;
                            }
                            next(err);
                        });
                    }
                    return res.status(422).render('auth/login', {
                        path: '/login',
                        pageTitle: 'Login',
                        errorMessage: 'Invalid email or password',
                        // userType: req.session.userType,
                        currentUser: req.userId,
                        oldInput: {
                            email: email,
                            password: password
                        },
                        validationErrors: []
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/auth/login');
            })
            
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postLogout = (req, res, next) => {
    // delete token from whitelist collection and clear cookie
    Whitelist.findOneAndDelete({ token: req.cookies.JWT_TOKEN })
    .then(result => {
        res.cookie("JWT_TOKEN", "", { maxAge: 1, httpOnly: true });
        res.redirect('/');
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.postSignup = (req, res, next) => {
    const first = req.body.first;
    const last = req.body.last;
    const display = req.body.display;
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
            currentUser: req.userId,
            oldInput: { 
                first: first,
                last: last,
                display: display,
                email: email, 
                phone: phone,
                password: password, 
                confirmPassword: confirmPassword 
            },
            validationErrors: errors.array()
        });
    }
    
    bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                firstName: first,
                lastName: last,
                displayName: display,
                email: email,
                phone: phone,
                photo: '',
                password: hashedPassword,
            });
            return user.save();
        })
        .then(result => {
            res.redirect('/auth/login');
            return transporter.sendMail({
                to: email,
                from: 'atTheCabin341@gmail.com',
                subject: '@theCabin Registration Successful',
                html: '<p>Dear ' + first + ',</p>' +
                    '<p>Thank your for registering with @theCabin!</p>' +
                    '<p>Sincerely,</p>' +
                    '<p> The @theCabin Staff</p>'
            });
        })  
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
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
                    // req.flash('error', 'No account found.');
                    return res.redirect('/auth/reset');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000; // expires in 1 hour
                return user.save();
            })
            .then(result => {
                res.redirect('/');
                transporter.sendMail({
                    to: req.body.email,
                    from: 'atTheCabin341@gmail.com',
                    subject: 'Password Reset',
                    html: `
                        <p>You requested a password reset</p>
                        <p>Click this <a href="http://localhost:5000/auth/reset/${token}">link</a> to set a new password.</p>
                    `
                });
            })
            .catch(err => {
                if(!err.statusCode) {
                    err.statusCode = 500;
                }
                next(err);
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
        return res.status(422).render('auth/edit-profile', {
            path: '/edit-profile',
            pageTitle: 'Edit Profile',
            errorMessage: errors.array()[0].msg,
            message: "",
            // userType: req.session.user.userType,
            currentUser: req.userId,
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
    User.findById(req.userId).then(user => {
        console.log(user);
        user.firstName = first;
        user.lastName = last;
        user.email = email;
        return user.save()
    })  
    .then(result => {
        // req.flash('notification', 'Profile Updated');
        res.redirect('../auth/edit-profile');
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.postUpdatePassword = (req, res, next) => {
    const newPassword = req.body.password;
    const newConfirmPassword = req.body.confirmPassword;
    const userId = req.userId;
    let resetUser;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/update-password', {
            path: '/update-password',
            pageTitle: 'UpdatePassword',
            errorMessage: errors.array()[0].msg,
            message: "",
            // userType: req.session.userType,
            currentUser: req.userId,
            password: newPassword,
            confirmPassword: newConfirmPassword,
            userId: userId,
            validationErrors: errors.array()
        });
    }
    User.findById(req.userId)
    .then(user => {
        resetUser = user;
        return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
        resetUser.password = hashedPassword;
        return resetUser.save();
    })  
    .then(result => {
        // req.flash('notification', 'Password Updated');
        res.redirect('../auth/update-password');
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return res.status(422).render('auth/reset/' + passwordToken, {
    //         path: '/reset',
    //         pageTitle: 'New Password',
    //         errorMessage: errors.array()[0].msg,
    //         currentUser: req.userId,
    //         validationErrors: errors.array()
    //     });
    // }

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
        res.redirect('/auth/login');
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};