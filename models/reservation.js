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
    type: String,
    required: true    
  }, 
  startDate: {
    type: Date,
    required: true    
  }, 
  endDate: {
    type: Date,
    required: true    
  }
});

module.exports = mongoose.model('Reservation', reservationSchema);


