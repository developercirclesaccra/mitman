'use strict'

// Import 3rd party libraries
const express = require('express');
const bodyParser = require('body-parser');

// Import app routes/modules
const webhook = require('./routes/webhook');
const createEvent = require('./routes/create-event');
const submitEvent = require('./routes/submit-event');

const app = express();

// If in development environment, read enviroment variables from local .env file
if (app.get('env') == 'development') {
  require('dotenv').config();
}

// Set app port
app.set('view engine', 'ejs');
app.set('port', (process.env.PORT || 3600));


// Import middleware for parsing requests
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Attach routes to the app
app.use('/webhook', webhook);
app.use('/create-event', createEvent);
app.use('/submit-event', submitEvent);

app.get('/', (req, res) => {
  res.render('home');
  //res.send(200, 'Welcome to Mitman Bot service. Contact our bot at https://www.facebook.com/Mitman-Bot-128096021205913/');
});
app.get('/privacy', (req, res) => {
  res.render('privacy');
});
app.get('/terms', (req, res) => {
  res.render('terms');
});

app.listen(app.get('port'), () => {
  console.log('Hello Human!')
  console.log('Mitman is running on port', app.get('port'));
});