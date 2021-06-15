const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const propertySchema = new Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  admins: [{ 
    user: { 
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User' 
    }
  }],  
  members: [{ 
    user: { 
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User' 
    }
  }],   
  imageUrls: [{
    type: String,
    required: true
  }],  
});

module.exports = mongoose.model('Property', propertySchema);


