'use strict';

const sendApi = require('../mitman/send-api');
const getUserProfile = require('../utils/get-user-profile');
const requestCall = require('../utils/request-call');
const dialogs = require('../utils/dialogs');

const handlePostback = event => {
  const payload = event.postback.payload;
  const senderId = event.sender.id;

  switch (payload) {
    case 'get_started':
      getUserProfile(senderId, (error, response, body) => {
        if (error) {
          throw error;
        };
        let user = JSON.parse(body);
        console.log('***User profile: ', user);
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
          }
        };
        requestCall(saveUserArgs, (error, response, body) => {
          if (error) {
            throw error;
          }
          console.log('***backend add user result: ', body);

          let welcomeMsg = "Hello " + user.first_name + "! My name is Mitman. I make your developer meetup experience awesome B-).";
          sendApi.sendMessage(senderId, { text: welcomeMsg }, () => {
            let quickreply = [
              {
                "content_type": "text",
                "title": "Attend a Meetup",
                "payload": "attend_meetup",
              },
              {
                "content_type": "text",
                "title": "Organize a Meetup",
                "payload": "organize_meetup",
              }
            ];
            let quickReplyMessage = {
              "text": "Are you attending or organizing a developer meetup?",
              "quick_replies": quickreply,
            };
            sendApi.sendMessage(senderId, quickReplyMessage);
          });

        })
      });
      break;
    case 'organize_meetup':
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
          }
        };
        requestCall(saveUserArgs, (error, response, body) => {
          if (error) {
            throw error;
          }
          console.log('*backend add user result: ', body);

          let msgJSON = {
            "text": "I have a simple form for you to fill in some details about your upcoming Meetup",
          };
          sendApi.sendMessage(senderId, msgJSON, () => {
            let formButton = {
              attachment: {
                type: "template",
                payload: {
                  template_type: "button",
                  text: "Fill in event details",
                  buttons: [{
                    type: "web_url",
                    url: process.env.SERVER_URL + "create-event",
                    title: "Event Details",
                    webview_height_ratio: "full",
                    messenger_extensions: true
                  }]
                }
              }
            };
            sendApi.sendMessage(senderId, formButton);
          });

        });
      });
      break;

    case 'attend_meetup':
      dialogs.attendMeetup(senderId);
      break;
  }
};

module.exports = handlePostback;