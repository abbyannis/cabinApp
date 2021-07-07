const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const inventorySchema = new Schema({
  inventory: {
    type: String,
    required: true,
  },
  amount: {
    type: int,
    required: true
  }
});

module.exports = mongoose.model('Inventory', inventorySchema);