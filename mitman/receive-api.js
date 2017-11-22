'use strict'

const sendApi = require('./send-api');
const getUserProfile = require('../utils/get-user-profile');
const requestCall = require('../utils/request-call');

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
          url_String: "https://mitman-server.herokuapp.com/user",
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
      break;

    case 'attend_meetup':
      let msg1 = "To attend a meetup, you need to scan the Messenger code for the meetup",
        msg2 = "To scan the code, tap the contacts icon - like the one shown in the image below ",
        msg3 = "Then tap 'Scan Messenger Code'",
        msg4 = "Then hold camera viewer over the code and it will open a conversation about your meetup";
     
      sendApi.sendMessage(senderId, {
        text: msg1,
      }, () => {
        sendApi.sendMessage(senderId, {
          text: msg2,
        }, () => {
          sendApi.sendMessage(senderId, {
            "attachment": {
              "type": "image",
              "payload": {
                "url": "https://s20.postimg.org/f6g6pxubx/messenger_scan_code_1.png",
              }
            }
          }, () => {
            sendApi.sendMessage(senderId, {
              text: msg3
            }, () => {
              sendApi.sendMessage(senderId, {
                "attachment": {
                  "type": "image",
                  "payload": {
                    "url": "https://s20.postimg.org/vhgama9el/messenger_scan_code_2.png",
                  }
                }
              }, () => {
                sendApi.sendMessage(senderId, {
                  text: msg4
                }, () => {
                  sendApi.sendMessage(senderId, {
                    "attachment": {
                      "type": "image",
                      "payload": {
                        "url": "https://s20.postimg.org/spa1z62bh/mitman_code_scan.png",
                      }
                    }
                  })
                })
              })
            })
          })
        })
      })
      
      
  }
};

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
        })
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
        sendApi.sendMessage(senderId, { text: msgText });
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
  handleMessage, handlePostback,
};