// for pages not requiring authorization but need to know if
// if user is logged in to know which menu items to show
module.exports = (req, res, next) => {
    const token = req.cookies.JWT_TOKEN;
    if(!token) {
        req.userId = false;
    } else {
        req.userId = true;
    }
    next();
}