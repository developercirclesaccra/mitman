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
    // let subLoad = payload.split('_')[0];

    // if (subLoad == 'viewagenda' || subLoad == 'reserveswag' || subLoad == 'givefeedback') {
    // }

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
      
      case 'meetup_options':
        let getUserArgs = {
          url_String: `${process.env.BACKEND_URL}user/${senderId}`,
          method_String: 'GET',
          headers_Object: {
            "mitman-token": process.env.MITMAN_TOKEN
          },
        };
        requestCall(getUserArgs, (err, response, body) => {
          console.log('*get user data from backend: ', body, typeof body);
          let userData = JSON.parse(body).user;
          let meetups = userData.meetups;
          let currentMeetup = meetups[meetups.length - 1];
          console.log('current meetup: ', currentMeetup, typeof currentMeetup);

          let getEventArgs = {
            url_String: `${process.env.BACKEND_URL}meetup/${currentMeetup}`,
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
            }
          });
        });
        break;
      
      case 'get_report':
        sendApi.sendMessage(senderId, { text: "Very soon you will be able to generate reports and statistics about your meetup event here. Look out for this button!" });
        
      default:
        sendApi.sendMessage(senderId, { text: "This feature is currently being worked on and will be coming soon" });
        return;
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