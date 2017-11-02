'use strict'

const sendApi = require('./send-api');

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
  handleMessage,
};