//will be waht the admin sees and can add things to the checklist 

const mongoose = require('mongose');
const Schema = mongoose.Schema;

const checkListMasterSchema = new Schema({
    task: {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        completed: {
            type: Boolean,
            required: true
        }
    }
})

module.exports.model('CheckList-Master', checkListMasterSchema);