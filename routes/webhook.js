'use strict'

const express = require('express');
const receiveApi = require('../mitman/receive-api')

// Initialise a new router
const router = express.Router();


// GETs are sent by the platform to verify the webhook
router.get('/', (req, res) => {
  if(
  	req.query &&
  	process.env.VERIFICATION_TOKEN &&
  	req.query['hub.verify_token'] === process.env.VERIFICATION_TOKEN
  ) {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('That\'s an error right there. Wrong token received');
  }
});


// POSTs are sent by the platform to report events to the configured webhook
router.post('/', (req, res) => {
  // We respond immediately with a 200 (otherwise the platform will retry)
  res.sendStatus(200);

  const data = req.body;
  console.log(
    'New request being processed: ' + JSON.stringify(data, null, 2));
  // We look only at page subscriptions in case the webhook is used for 
  // other types of subscriptions
  if (data.object !== 'page') {
  	return;
  }

  // We start iterating over all the entries
  data.entry.forEach((entry) => {
    // In each entry we iterate over the messaging events
    entry.messaging.forEach((messagingEvent) => {
      // We process each type of messaging event
      if (messagingEvent.message) {
      	receiveApi.handleMessage(messagingEvent);
      } else if (messagingEvent.postback) {
        receiveApi.handlePostback(messagingEvent);
      } else if (messagingEvent.referral) {
        console.log('Referral webhook triggered...', messagingEvent);
        receiveApi.handleReferral(messagingEvent);
      }
    });
  });
});


module.exports = router;