const mongoose = require('mongoose');

const weatherDataSchema = new mongoose.Schema({
  city: String,
  weather: Object,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('WeatherData', weatherDataSchema);
