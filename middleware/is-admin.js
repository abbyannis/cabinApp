module.exports = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/');
    } 
    if (req.session.userType !== 'admin') {
        return res.redirect('/');
    }
    next();
}