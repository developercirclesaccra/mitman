'use strict'

const sendApi = require('../mitman/send-api');
const getUserProfile = require('../utils/get-user-profile');
const requestCall = require('../utils/request-call');
const dialogs = require('../utils/dialogs');
const moment = require('moment');

const handleMessage = event => {
  const message = event.message;
  const senderId = event.sender.id;

  // if (!message.text) {
  // 	return;
  // }

  if (message.quick_reply) {
    console.log('QR recived');
    let quickReply = message.quick_reply;
    let payload = quickReply.payload;

    switch (payload) {
      case 'organize_meetup':
        let msgJSON = {
          "text": "I have a simple form for you to fill in some details about your upcoming Meetup",
        };
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
            console.log('*backend add user result: ', body);

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
  } else if (message.text) {

    let msgText = message.text;

    //Customized responses
    switch (msgText) {
      case 'Good morning':
        let response = 'Good morning to you too dear';
        sendApi.sendMessage(senderId, { text: response });

      // If the options don't match, just echo back the message to the user
      default:
        dialogs.welcome(senderId);

    }
    // // Use NLP to change the message in case it's a greeting
    // if (message.nlp && message.nlp.entities.greetings) {
    //   let greetings = message.nlp.entities.greetings;
    //   let isGreeting = greetings.filter((greeting) => {
    //     return greeting.confidence > 0.95;  
    //   }).length > 0;
    //   if (isGreeting) {
    //     text = 'Welcome to Mitman!';
    //   }
    // }
    // sendApi.sendMessage(senderId, {text: text});
  }
};

module.exports = handleMessage;