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
  console.log('*Meetup json received: ', eventJSON, typeof eventJSON);
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
    console.log('*User data obtained from backend: ', body, typeof body);
    let userData = JSON.parse(body);
    if (userData.success) {
      let addEventArgs = {
        url_String: process.env.BACKEND_URL + 'meetup',
        method_String: 'POST',
        headers_Object: {
          "content-type": "application/json",
          "mitman-token": process.env.MITMAN_TOKEN,
        },
        jsonData_Object: {
          "name": eventJSON.name,
          "format": eventJSON.format,
          "date": eventJSON.date,
          "start_time": eventJSON.start_time,
          "end_time": eventJSON.end_time,
          "feedback_time": eventJSON.feedback_time,
          "venue": eventJSON.venue,
          "description": eventJSON.description,
          "agenda": eventJSON.agenda,
          "is_swag": eventJSON.is_swag,
          "organizer": userData.user._id
        },
      };
      requestCall(addEventArgs, (err, resp, body) => {
        if (err) { throw err };
        console.log('*created event: ', body);
        if (body.success) {
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
                ref: `organizer_${senderId}_event_${body.meetup._id}`,
              },
              image_size: 1000
            },
          };
          console.log('*parametric code args: ', codeArgs);
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
      })
    }
  })
  
});

module.exports = router;