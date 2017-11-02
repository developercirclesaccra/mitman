'use strict'

// Import 3rd party libraries
const express = require('express');
const bodyParser = require('body-parser');

// Import app routes/modules
const webhook = require('./routes/webhook');

const app = express();

// If in development environment, read enviroment variables from local .env file
if (app.get('env') == 'development') {
  require('dotenv').config();
}

// Set app port 
app.set('port', (process.env.PORT || 3001));


// Import middleware for parsing requests
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Attach routes to the app
app.use('/webhook', webhook);

app.listen(app.get('port'), () => {
  console.log('Hello Human!')
  console.log('Mitman is running on port', app.get('port'));
});