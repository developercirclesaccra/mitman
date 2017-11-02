'use strict'

const request = require('request');

const sendMessage = (recipientId, messagePayload) => {
  let messageJSON = {
    recipient: {
      id: recipientId,
    },
    message: messagePayload,
  };
  callMessagesApi(messageJSON);
}


const callMessagesApi = (messageJSON, queryParams = {}) => {
  return callApi('messages', messageJSON, queryParams);
};

const callApi = (endPoint, messageJSON, queryParams = {}) => {
  
  // Make sure the page access token is added as a query param
  const query = Object.assign(
    {access_token: process.env.PAGE_ACCESS_TOKEN}, 
    queryParams);

  request({
  	uri: `https://graph.facebook.com/v2.10/me/${endPoint}`,
  	qs: query,
  	method: 'POST',
  	json: messageJSON,
  }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      console.log(
        `Successfully sent message to ${endPoint} endpoint: `,
        JSON.stringify(body)
      );
    } else {
      // Something went wrong
      console.error(
        `Failed calling Messenger API endpoint ${endPoint}`,
        response.statusCode,
        response.statusMessage,
        body.error,
        queryParams
      );
    }
  });
};

module.exports = {
  sendMessage,
};
