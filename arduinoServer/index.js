var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var _ = require('lodash');

var morgan       = require('morgan');
// Create the application.
var app = express();

var configDB = require('./config/database');
var secret = require('./config/secret');
var port = 3000;

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var User   = require('./models/User'); // get our mongoose models
var ArduinoReport   = require('./models/ArduinoReport');

// Add Middleware necessary for REST API's
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));

app.use(morgan('dev')); // log every request to the console

app.set('superSecret', secret); // secret variable

// CORS Support
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Connect to MongoDB
mongoose.connect(configDB.url);
mongoose.connection.once('open', function() {

  // Load the models.
  app.models = require('./models/index');

  app.get('/setup', function(req, res) {

    // create a sample user
    var nick = new User({
      username: 'tami',
      password: 'deni',
      admin: true,
      arduinos_id: ['1','2','4']
    });
    nick.save(function(err) {
      if (err) throw err;

      console.log('User saved successfully');
      res.json({ success: true });
    });
  });

  // basic route (http://localhost:8080)
  app.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
  });

  // ---------------------------------------------------------
  // get an instance of the router for api routes
  // ---------------------------------------------------------
  var apiRoutes = express.Router();

  // ---------------------------------------------------------
  // authentication (no middleware necessary since this isnt authenticated)
  // ---------------------------------------------------------
  // http://localhost:8080/api/authenticate
  apiRoutes.post('/authenticate', function(req, res) {

    // find the user
    User.findOne({
      username: req.body.username
    }, function(err, user) {

      if (err) throw err;

      if (!user) {
        res.json({ success: false, message: 'Authentication failed. User not found.' });
      } else if (user) {

        // check if password matches
        if (user.password != req.body.password) {
          res.json({ success: false, message: 'Authentication failed. Wrong password.' });
        } else {

          // if user is found and password is right
          // create a token
          var token = jwt.sign(user, app.get('superSecret'), {
            expiresInMinutes: 1440 // expires in 24 hours
          });

          res.json({
            success: true,
            message: 'Enjoy your token!',
            token: token
          });
        }

      }

    });
  });

  // ---------------------------------------------------------
  // route middleware to authenticate and check token
  // ---------------------------------------------------------
  apiRoutes.use(function(req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.param('token') || req.headers['x-access-token'];

    // decode token
    if (token) {

      // verifies secret and checks exp
      jwt.verify(token, app.get('superSecret'), function(err, decoded) {
        if (err) {
          return res.json({ success: false, message: 'Failed to authenticate token.' });
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;
          next();
        }
      });

    } else {

      // if there is no token
      // return an error
      return res.status(403).send({
        success: false,
        message: 'No token provided.'
      });

    }

  });

  // ---------------------------------------------------------
  // authenticated routes
  // ---------------------------------------------------------
  apiRoutes.get('/', function(req, res) {
    res.json({ message: 'Welcome to the coolest API on earth!' });
  });

  apiRoutes.get('/profile', function(req, res) {
    res.json(req.decoded);
  });

  apiRoutes.get('/arduinos', function(req, res) {
   ArduinoReport.find({'arduino_id':{$in: req.decoded.arduinos_id}}, function(err, ownedArduinos){
     res.json(ownedArduinos);
   });
  });
  // arduino owned authentication route:
  apiRoutes.use('/arduinos/:arduino_id', function(req, res, next){
    if(req.decoded.arduinos_id.indexOf(req.params.arduino_id)>-1){
      next()
    }
    else {
      return res.status(401).send({
        success: false,
        message: 'You do not own this arduino'
      });
    }
  });

  apiRoutes.get('/arduinos/:arduino_id', function(req, res){
    ArduinoReport.findOne({'arduino_id': req.params.arduino_id}, function(err, arduino){
      res.json(arduino);
    });
  });
  apiRoutes.post('/arduinos/:arduino_id/postData', function(req, res){
    console.log(req.body);
  });
  apiRoutes.use(function(req, res, next){
    if(req.decoded.admin){
      next();
    }
    else {
      return res.status(401).send({
        success: false,
        message: 'Only admins can access here'
      });
    }

  });

  apiRoutes.get('/users', function(req, res) {
    User.find({}, function(err, users) {
      res.json(users);
    });
  });

  app.use('/api', apiRoutes);
  // Load the routes.
  var routes = require('./routes');
  _.each(routes, function(controller, route) {
    app.use(route, controller(app, route));
  });
  // =================================================================
  // start the server ================================================
  // =================================================================
  app.listen(port);
  console.log('Magic happens at http://localhost:' + port);
});
