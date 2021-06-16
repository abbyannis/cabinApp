const routes = require('express').Router();
const reservations = require('./reservation');
const mainController = require('../controllers/main');

routes
    .get('/', require('./main'))
    .use('/reservation/', reservations)
    .use((error, req, res, next) => {
        res.status(500).render('errors/500', { 
            pageTitle: 'Error!', 
            path: '/500'
        });
    });

module.exports = routes;