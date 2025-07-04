const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(express.json());

app.use('/api', require('./routes/api'));

mongoose.connect("mongodb://localhost:27017/college_system", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = app;
