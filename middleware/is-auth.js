const jwt = require('jsonwebtoken');
const whitelist = require('../models/whitelist');

// This will give access to req.userId on any routes isAuth is added to
// See below for additional code that needs to be included in other files
module.exports = (req, res, next) => {
    // get token from cookie
    const token = req.cookies.JWT_TOKEN;
    // if no token, throw error
    if (!token) {
        const error = new Error('Not authenticated');
        error.statusCode = 401;
        throw error;
    }
    // to make sure user has not logged out before token expiration
    whitelist.find({ dbToken: token })
        .then(dbToken => {
            if(dbToken) {
                let decodedToken;
            try {
                // set decodedToken to token
                decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
            } catch (err) {
                err.statusCode = 500;
                throw err;
            }
            // if no token, throw error
            if (!decodedToken) {
                const error = new Error('Not authenticated');
                error.statusCode = 401;
                throw error;
            }
            // get user ID from token
            req.userId = decodedToken.userId;
            next();
            }
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};


// Add the following to routes requiring authorization

// Add at top of route file:
// const isAuth = require('../middleware/is-auth');
// And add isAuth to all applicable routes



// Add at the top of the user or auth controller file
// const jwt = require('jsonwebtoken');

// In the same file as above (user or auth controller), add 
// the following to the login process after login is authorized

// const token = jwt.sign({
//     email: loadedUser.email, 
//     userId: loadedUser._id.toString()
// }, 
// 'weneedasecrethere', 
// { expiresIn: '1h' }
// );

// This will also need to be added to set the token in the header
// This was pulled from Max's React files, so syntax will probably need to be tweaked

// headers: { 
//     Authorization: 'Bearer ' + this.props.token
//   }

