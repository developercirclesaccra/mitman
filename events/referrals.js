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
      getUserProfile(senderId, (error, response, body) => {
        if (error) {
          throw error;
        };
        let user = JSON.parse(body);
        console.log('*User profile: ', user);
        let saveUserArgs = {
          url_String: process.env.BACKEND_URL + "user",
          method_String: 'POST',
          headers_Object: {
            "content-type": "application/json",
            "mitman-token": process.env.MITMAN_TOKEN
          },
          jsonData_Object: {
            first_name: user.first_name,
            last_name: user.last_name,
            fb_id: user.id,
            meetup: meetup._id
          }
        };
        requestCall(saveUserArgs, (error, response, body) => {
          if (error) {
            throw error;
          }
          console.log('*backend add user result: ', body);

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
        });
      });
    }
  })
}

module.exports = handleReferral;