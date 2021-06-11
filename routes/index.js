const routes = require('express').Router();
const mainController = require('../controllers/main');

routes
    .get('/', require('./main'))
    .use((error, req, res, next) => {
        res.status(500).render('errors/500', { 
            pageTitle: 'Error!', 
            path: '/500'
        });
    });

module.exports = routes;