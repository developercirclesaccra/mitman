'use strict';

const request = require('request');

const requestCall = (paramArgs, callback) => {
  let params = {
    url: paramArgs.url_String,
    headers: paramArgs.headers_Object,
    qs: paramArgs.qs_Object,
    method: paramArgs.method_String,
    json: paramArgs.jsonData_Object
  };
  request(params, callback);
}

module.exports = requestCall;