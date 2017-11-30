'use strict'

const express = require('express');
const router = express.Router();
const requestCall = require('../utils/request-call');
const sendApi = require('../mitman/send-api');

router.post('/', (req, res) => {
  res.send({
    status: 200,
    msg: 'Event data received',
  });
  let eventJSON = req.body.eventJSON;

  let senderId = eventJSON.fbId;

  let getUserArgs = {
    url_String: process.env.BACKEND_URL + 'user/' + senderId,
    method_String: 'GET',
    headers_Object: {
      "mitman-token": process.env.MITMAN_TOKEN,
    },
  };
  requestCall(getUserArgs, (err, resp, body) => {
    if (err) { throw err };
    let userData = JSON.parse(body);
    if (userData.success) {
      console.log('about to add organizer tojson...');
      eventJSON.organizer = userData.user._id;
      let addEventArgs = {
        url_String: process.env.BACKEND_URL + 'event',
        method_String: 'POST',
        headers_Object: {
          "content-type": "application/json",
          "mitman-token": process.env.MITMAN_TOKEN,
        },
        jsonData_Object: {
          event: eventJSON,
        },
      };
      requestCall(addEventArgs, (err, resp, body) => {
        if (err) { throw err };
        if (body.success) {
          let eventId = body.event._id;
          console.log('*created event: ', body);
          let codeArgs = {
            url_String: "https://graph.facebook.com/v2.6/me/messenger_codes",
            method_String: 'POST',
            headers_Object: {
              "content-type": "application/json"
            },
            qs_Object: {
              access_token: process.env.PAGE_ACCESS_TOKEN
            },
            jsonData_Object: {
              type: "standard",
              data: {
                ref: 'organizer_' + senderId + '_event_' + eventId,
              },
              image_size: 1000
            },
          };
          requestCall(codeArgs, (error, response, body) => {
            if (error) {
              throw error;
            };
            let eventCode = body.uri;
            let imageJSON = {
              "attachment": {
                "type": "image",
                "payload": {
                  "url": eventCode,
                }
              }
            };
            sendApi.sendMessage(senderId, { text: 'Please print the image below to be scanned by attendees at your meetup.' }, () => {
              sendApi.sendMessage(senderId, imageJSON);
            });
            return;
          })
          return;
        }
        return console.log('*add event result: ', body)
      })
    }
    return console.log('*get user from fbid: ', body);
  })
  
});

module.exports = router;