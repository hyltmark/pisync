'use strict';

var fs = require('fs')
  , async = require('async')
  , remoteHandler = require('./controllers/remotehandler')
  , notifier = require('./libs/notifier')
  , projectHandler = require('./controllers/projecthandler')
  , programHandler = require('./libs/programhandler')
  , config = require('./configs/general')
  , notifierPrependString = ': ';


module.exports.cli = function() {

  //I think this is needed to properly handle cleanUp. But havn't played around with it yet.
  process.stdin.resume();

  programHandler.loadCommands(__dirname + '/configs/commands');

  notifier.setTitle('PI Sync!');

  if (programHandler.getExecutedCommand().name === 'init') {
    projectHandler.init(function(err) {

      if (err) { 
        notifier.log(err, 'error');
        process.exit();
      }
      else {
        projectHandler.getConfig(function(err, projectConfig) {

          if (err) {
            notifier.log(projectConfig, 'error');
          }
          else {
            notifier.notify(projectConfig.id + ' added.');
          }

        });

      }
    });

  }
  else {
    
    projectHandler.getConfig(function(err, projectConfig) {

      if (err) {
        notifier.log(projectConfig, 'error');
      }
      else {

        if (config.debug.active && (config.debug.dontConnect)) {
          notifier.log('general.debug.dontConnect set. Skip connect.', 'info');
          initCommandGroups(projectConfig);
        }
        else {

          notifier.setPrependString(projectConfig.id + notifierPrependString);


          //add support for devices here and not just one single remote setting. Also, make sure to add support for many devices.
          var sshOptions = {
            host: projectConfig.remote.host,
            port: projectConfig.remote.port,
            username: projectConfig.remote.username,
            privateKey: projectConfig.remote.privateKey
          };

          remoteHandler.connect(sshOptions, function(err) {

            if (err) {
              handleError(err);
            }
            else {
              initCommandGroups(projectConfig);
            }

          });

        }
      }
    });

  }

  //do something when app is closing
  process.on('exit', exitHandler.bind(null,{cleanup:true}));

  //catches ctrl+c event
  process.on('SIGINT', exitHandler.bind(null, {exit:true}));

  //catches uncaught exceptions
  process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

};

function initCommandGroups(projectConfig) {

  var commandGroups = [];

  //commands will no longer be in config/commands.json as they will be in each task config as npm packages. So this code needs to be rewritten
  var commandsConfig = require('./configs/commands.json')[programHandler.getExecutedCommand().name];

  commandsConfig.commandGroups.forEach(function(command) {

    command.value = (command.value === '[value]') ? programHandler.getExecutedCommand().value : 'default'; //get value from arguments by user.

    commandGroups.push(
      function(cb) {

        notifier.log(commandGroup.text.start, 'info');

        remoteHandler.runCommandGroup(command, projectConfig, function(err) {

          if (err) {
            notifier.notify(command.text.error);
            handleError(err);
          }
          else {
            notifier.notify(command.text.success);
          }

          cb(err);

      });

    });
  
  });

  async.eachSeries(commandGroups, function run(commandGroup, callback) {   
    commandGroup(callback);
  },
  function(err) {  
    process.exit();        
  });
  
}

function cleanUp(cb) {

  process.stdin.pause();
  remoteHandler.disconnect();

  notifier.log('Jobs\'s done...', 'success');
}

function handleError(err) {
  notifier.log(err, 'error');
  process.exit();
}

function exitHandler(options, err) {
    if (options.cleanup) {
      cleanUp(function() {
        process.exit();
      });
    }
    if (err) console.log(err.stack);
    if (options.exit) process.exit();
}