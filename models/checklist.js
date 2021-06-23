const mongoose = require('mongose');
const Schema = mongoose.Schema;

const checkListSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    propertyId: {
        type: Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    reservationId: {
        type: Schema.Types.ObjectId,
        ref: 'Reservation',
        required: true
    },
    inDate: {
        type: Schema.Types.Date
    },
    outDate: {
        type: Schema.Types.Date
    },
    userTaskLog: {
            task: {
                type: Schema.Types.ObjectId, 
                ref: 'CheckList-Master', 
                required: true
            }
    }
        //array of objects 
        // two properties type Schema objectID linked to admin task
        // second is Bool that is set by user

    
})

module.exports.model('Checklist', checkListSchema);