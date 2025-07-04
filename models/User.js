const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String
},
  password: {
    type: String
},
  role: {
    type: String, 
    enum: ['student', 'professor'] 
}
});

module.exports = mongoose.model('User', userSchema);
