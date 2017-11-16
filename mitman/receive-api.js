'use strict'

const sendApi = require('./send-api');
const getUserProfile = require('../utils/get-user-profile');

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
      });
  }
};

const handleMessage = (event) => {
  const message = event.message;
  const senderId = event.sender.id;

  if (!message.text) {
  	return;
  }
  
  let text = message.text;

  //Customized responses
  switch (text) {
    case 'Good morning':
      let response = 'Good morning to you too dear';
      sendApi.sendMessage(senderId, { text: response });

    // If the options don't match, just echo back the message to the user
    default:
      sendApi.sendMessage(senderId, { text: text });
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

};

module.exports = {
  handleMessage, handlePostback,
};