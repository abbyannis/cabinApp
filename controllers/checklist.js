const Checklist = require('../models/checklist');
const ChecklistMaster = require('../models/checklist-master');

const Property = require('../models/property');

exports.getChecklist = (req, res, next) => {
    //const propId = req.params.propertyId;
    Checklist.find({property: req.params.propertyId})
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
        user = req.session.user,
        property = req.params.propertyId
    });
    checklist
        .save()
        .then(result => {
            console.log('Checklist Updated');
            res.redirect('/') //Where are we redirecting? Home page?
        })
        .catch(err => {console.log(err);});
};

//for admin controller
// //edit exsiting checklist

// exports.getAddChecklist = (req, res, next) => {
//     res.render('admin/edit-checklist', {
//         pageTitle: "Add Checklist",
//         path: '/admin/edit-checklist',
//         editing: false
//     });
// }
// exports.postAddChecklist = (req, res, next) => {
//     const title = req.body.title;
//     const description = req.body.description;
//     res.render('admin/edit-checklist', {
//         pageTitle: 'Add Checklist',
//         path: '/admin/edit-checklist',
//         editing: false,
//         checklist: {
//             title: title,
//             description: description
//         }
//     });
//     const checklist = new ChecklistMaster({
//         title: title, 
//         description: description 
//     });
//     checklist
//         .save()
//         .then(result => {
//             console.log('Checklist Created');
//             res.redirect('/checklists/checklist')
//         })
//         .catch(err => {
//             console.log(err);
//         });

// };

// exports.getEditChecklist = (req, res, next) => {
//     const editMode = req.query.edit;
//     if (!editMode) {
//       return res.redirect('/');
//     }
//     const propId = req.params.propertyId;
//     Property.findById(propId)
//       .then(checklist => {
//         if (!checklist) {
//           return res.redirect('/');
//         }
//         res.render('admin/edit-checklist', {
//           pageTitle: 'Edit Checklist',
//           path: '/admin/edit-checklist',
//           editing: editMode
//         });
//       })
//       .catch(err => console.log(err));
//   };

//   // save editied checklist
//   exports.postEditChecklist = (req, res, next) => {
//     const propId = req.body.propertyId;
//     const updatedTitle = req.body.title;
//     const updatedDesc = req.body.description;
    
//       res.status(422).render('admin/edit-checklist', {
//         pageTitle: 'Edit Checklist',
//         path: '/admin/edit-checklist',
//         editing: true,
//         checklist: {
//           title: updatedTitle,
//           description: updatedDesc,
//           _id: propId
//         }
//       });
    
  
//     Property.findById(propId)
//       .then(checklist => {
//         checklist.title = updatedTitle;
//         checklist.description = updatedDesc;
//         return checklist.save().then(result => {
//           console.log('Checklist has been updated!');
//           res.redirect('/admin/edit-chechlist');
//         });
//       })
//       .catch(err => console.log(err));
//   };