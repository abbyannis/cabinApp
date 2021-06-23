const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const inventorySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'item' 
  },
  amount: {
    type: int,
    required: true    
  }
});

module.exports = mongoose.model('Inventory', inventorySchema);