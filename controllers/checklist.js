const Checklist = require('../models/checklist');

exports.getChecklist = (req, res, next) => {
    Checklist.find({ propertyId: req.property._id})
    .then(tasks => {
        console.log(tasks);
        res.render('checklists/checklist', {
            tasks: tasks,
            pageTitle: 'Cabin Checklist',
            path: '/checklists/checklist'
        });
    })
    .catch(err => console.log(err));
};

exports.postChecklist = (req, res, next) => {
    const updatedTaskLog = req.params.userTaskLog;
    const checklist = new Checklist({
        userTaskLog = updatedTaskLog,
        userId = req.user
    });
    checklist
        .save()
        .then(result => {
            console.log('Checklist Updated');
            res.redirect('/') //Where are we redirecting? Home page?
        })
        .catch(err => {console.log(err);});
};