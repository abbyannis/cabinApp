const mongoose = require('mongoose');
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
        // completed: {
        //     type: Boolean,
        //     required: true
        // }
    }
})

module.exports = mongoose.model('CheckList-Master', checkListMasterSchema);