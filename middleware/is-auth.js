const jwt = require('jsonwebtoken');

// This will give access to req.userId on any routes isAuth is added to
// See below for additional code that needs to be included in other files
module.exports = (req, res, next) => {
    // get header containing token
    const authHeader = req.get('Authorization');
    // if no token, throw error
    if (!authHeader) {
        const error = new Error('Not authenticated');
        error.statusCode = 401;
        throw error;
    }
    // extract token
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        // set decodedToken to token
        // secret here and in user/auth file must match
        decodedToken = jwt.verify(token, 'weneedasecrethere');
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

