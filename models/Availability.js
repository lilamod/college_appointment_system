const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  professor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
},
  time: [String]
});

module.exports = mongoose.model('Availability', availabilitySchema);
