var mongoose = require('mongoose');

// Create the MovieSchema.
var TempretureSchema = new mongoose.Schema({
  title: {
    type: double,
    required: true
  },
  url: {
    type: String,
    required: true
  }
});

// Export the model schema.
module.exports = MovieSchema;
