const sendApi = require('../mitman/send-api');
const getUserProfile = require('./get-user-profile');
const requestCall = require('./request-call');

module.exports.welcome = senderId => {
  getUserProfile(senderId, (error, response, body) => {
    if (error) {
      throw error;
    };
    let user = JSON.parse(body);
    console.log('***User profile: ', user);
    if (user) {
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
    };
  });
}

module.exports.attendMeetup = senderId => {
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
              });
            });
          });
        });
      });
    });
  });
}