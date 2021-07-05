const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const checkListSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    property: {
        type: Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    reservation: {
        type: Schema.Types.ObjectId,
        ref: 'Reservation',
        required: true
    },
    userTaskLog: {
            checklist: [
                {
                    task: {type: Schema.Types.ObjectId, 
                            ref: 'CheckList-Master', 
                            required: true
                    },
                    completed: {
                        type: Boolean
                    }
                }
            ]
    }  
    
}, { timestamps: true })

module.exports = mongoose.model('Checklist', checkListSchema);
