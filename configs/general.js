'use strict';

var path = require('path')
  , rootPath = path.normalize(__dirname + '/../');

module.exports = {
  "name": "Pisync",
  "bin": "pis",  
  "configFileName": "pisync.json",
  "paths": {
    "rootDir": rootPath,
    "configs": {
      "defaultPisync": rootPath + 'configs/defaultpisync.json',
      "rootDir": rootPath + "configs/"
    }
  },
  "debug": {
    "active": false,
    "dontUpload": true,
    "dontExecuteCommands": true,
    "dontConnect": true
  }
};