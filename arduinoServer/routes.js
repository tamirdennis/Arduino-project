module.exports = {
  '/api/arduinos/:arduino_id': require('./controllers/ArduinoReportController'),
  '/userControl': require('./controllers/UserController')
};
