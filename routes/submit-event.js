'use strict'

const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  res.send({
    status: 200,
    msg: 'Event data received',
  });
  let eventJSON = req.body.eventJSON;
  return console.log('*eventJSON received: ', eventJSON);
});

module.exports = router;