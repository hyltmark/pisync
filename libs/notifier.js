'use strict';

var notifier = require('node-notifier')
  , prependString = ''
  , moment = require('moment')
  , colour = require('colour')
  , title = '';

module.exports.setPrependString = function(str) {
  prependString = str;  
};

module.exports.setTitle = function(str) {
  title = str;  
};

module.exports.notify = function(str) {


  str = prependString + str;

  notifier.notify({
    'title': title,
    'message': str
  });  

  log(str);
 
};

module.exports.log = log;

function log(message, messageType) {

  messageType = messageType || '';

  message = moment().format('hh:mm:ss') + ' ' + message;

  switch (messageType) {
    case '':
      console.log(message);
    break;
    case 'info':
      console.log(message.yellow);
    break;
    case 'warning':
      console.log(message.yellow);
    break;
    case 'error':
      console.log(message.red);
    break;
    case 'success':
      console.log(message.green);
    break;
    case 'remote':
      console.log(message.grey);
    break;
    default:
      console.log(message);    
    break; 

  }
  
}