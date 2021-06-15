const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reservationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User' 
  },
  property: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Property' 
  },
  status: {
    type: Schema.Types.String,
    required: true    
  }, 
  startDate: {
    type: Schema.Types.Date,
    required: true    
  }, 
  endDate: {
    type: Schema.Types.Date,
    required: true    
  }
});

module.exports = mongoose.model('Reservation', reservationSchema);


