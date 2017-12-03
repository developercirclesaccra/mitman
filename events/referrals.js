'use strict'

const sendApi = require('../mitman/send-api');
const getUserProfile = require('../utils/get-user-profile');
const requestCall = require('../utils/request-call');
const dialogs = require('../utils/dialogs');
const moment = require('moment');



const handleReferral = event => {
  const ref = event.referral.ref;
  const senderId = event.sender.id;
  const organizerId = ref.split("_")[1];
  const eventId = ref.split('_')[3];

  let getEventArgs = {
    url_String: process.env.BACKEND_URL + "meetup/" + eventId,
    method_String: 'GET',
    headers_Object: {
      "mitman-token": process.env.MITMAN_TOKEN,
    },
  };
  requestCall(getEventArgs, (err, resp, body) => {
    if (err) {
      throw err;
    };
    console.log('*Get event result: ', body, typeof body);
    let meetupData = JSON.parse(body);
    if (meetupData.success) {
      let meetup = meetupData.meetup;
      let meetTime = `${meetup.date} ${meetup.start_time}`;
      if (moment(meetTime).isBefore()) {
        let msg = `Your ${meetup.name} meetup was held ${moment(meetTime).fromNow()}. `;
        sendApi.sendMessage(senderId, { text: msg }, () => {
          sendApi.sendMessage(senderId, {
            "text": "Would you like to give feedback?",
            "quick_replies": [
              {
                "content_type": "text",
                "title": "Give feedback",
                "payload": `givefeedback_${meetup._id}`
              }
            ]
          });
        });
        return;
      } else if (moment(meetTime).isAfter()) {
        let msg = `Your ${meetup.name} meetup is holding ${moment(meetTime).fromNow()}. `;
        sendApi.sendMessage(senderId, { text: msg }, () => {
          sendApi.sendMessage(senderId, {
            "text": "What would you like to do?",
            "quick_replies": [
              {
                "content_type": "text",
                "title": "View agenda",
                "payload": `viewagenda_${meetup._id}`
              },
              {
                "content_type": "text",
                "title": "Reserve SWAG",
                "payload": `reserveswag_${meetup._id}`
              },
              {
                "content_type": "text",
                "title": "Give feedback",
                "payload": `givefeedback_${meetup._id}`
              }
            ]
          });
        });
        return;
      }
    }
  })
}

module.exports = handleReferral;