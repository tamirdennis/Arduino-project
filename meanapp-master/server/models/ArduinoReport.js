var mongoose = require('mongoose');

// Create the ArduinoReportSchema.
var arduinoReportSchema = new mongoose.Schema({
  arduino_id: {
    type: String,
    required: true
  },
  time: {
    type: Number,
    required: true
  }
  /*here will be added more properties by the arduino threw http requests.
   each property added, will be with data of a sensor with the following name:
   property name is : 'nameOfSensor'+'indexNumberOfSensor' (the index number is for cases whice
 there is for example more then one tempreture sensors). (The property value will be a number representing
 the data of this sensor in the specific time).*/
});
// Export the model schema.
module.exports = mongoose.model('ArduinoReport', arduinoReportSchema);
