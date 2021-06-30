const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const { json } = require('body-parser');

// loads calendar for current month
// will need to add way to highlight unavailable dates
exports.getIndex = (req, res, next) => {
    // const cookie = req.cookies.JWT_TOKEN;
    // console.log(cookie);
    // this will need to reworked to dynamically create this array
    const images = ['images/landscape3.jpeg', '/images/2021-06-10EclipseFlybywm1066.jpeg', '/images/landscape2.jpeg', '/images/AuroraClouds_Boffelli_1080.jpeg', '/images/landscape1.jpeg']
    const dates = [];
    // when added manually, month is current month # minus 1 (e.g., January = 0, May = 4)
    // both below equal July 1, 2021
    // new Date(2021, 06, 01)  
    // new Date('2021-07-01T06:00:00.000Z')
    const today = new Date();  
    const date = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthName = date.toLocaleString('default', { month: 'long' });
    const month = date.getMonth();
    const year = date.getFullYear();
    const startDay = date.getDay() + 1; // first day of the week for the month
    const daysInMonth= new Date(year, month + 1, 0).getDate();
    
    for(i = 0; i < daysInMonth; i++) {
        dates[i] = { date: new Date(year, month, i + 1), available: true };
    }
    //res.status(200).json({ 'message': 'Success!' })
    res.render('index', {
        // res.render('reservations/calendar', {
            pageTitle: 'Dashboard',
            path: '/',
            dates: dates, 
            month: month,
            monthName: monthName,
            year: year,
            startDay: startDay,
            currentMonth: month,
            currentYear: year,
            images: images,
            currentUser: req.session.user,
            isAuthenticate: req.session.LoggedIn
        });
}
  