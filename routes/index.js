const routes = require('express').Router();
const reservations = require('./reservation');
const main = require('./main');
const admin = require('./admin');
const auth = require('./auth');
const user = require('./user');
const mainController = require('../controllers/main');

routes
    .get('/', main)
    .use('/main', main)
    .use('/reservation/', reservations)
    .use('/admin/', admin)
    .use('/auth', auth)
    .use('/user', user)
    // .use((error, req, res, next) => {
    //     res.status(500).render('errors/500', { 
    //         pageTitle: 'Error!', 
    //         path: '/500'
    //     });
    // });

module.exports = routes;