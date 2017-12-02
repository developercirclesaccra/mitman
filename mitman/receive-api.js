'use strict'

const sendApi = require('./send-api');
const getUserProfile = require('../utils/get-user-profile');
const requestCall = require('../utils/request-call');
const dialogs = require('../utils/dialogs');
const moment = require('moment');

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
          if (body.success) {
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
          }
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
          if (body.success) {
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
          }
        });
      });
      break;

    case 'attend_meetup':
      dialogs.attendMeetup(senderId);
  }
};

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

const handleMessage = (event) => {
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
            if (body.success) {
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
            }
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

module.exports = {
  handleMessage, handlePostback, handleReferral
};