'use strict';

const requestCall = require('./request-call');

const getUserProfile = (userID, callback) => {
  let userProfileArgs = {
    url_String: "https://graph.facebook.com/v2.10/" + userID + "?fields=first_name,last_name,gender",
    qs_Object: {
      access_token: process.env.PAGE_ACCESS_TOKEN
    },
    method_String: 'GET'
  };
  requestCall(userProfileArgs, callback);
}

module.exports = getUserProfile;