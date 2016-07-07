'use strict';

var watch = require('node-watch')
  , Ssh2 = require('ssh2')
  , ssh = null
  , prompt = require('prompt')
  , async = require('async')
  , shellescape = require('shell-escape')
  , fs = require('fs')
  , _ = require('lodash')
  , notifier = require('../libs/notifier')
  , config = require('../configs/general')
  , commandVariables = {};

 
function connect(options, cb) {

  ssh = new Ssh2();

  ssh.on('ready', function () {
    notifier.log('Connected to ' + options.username + '@' + options.host, 'success');
    cb('');     
  });

  if (options.privateKey != '') {
    options.privateKey = require('fs').readFileSync(options.privateKey);    
  }

  ssh.connect(options);

  //I think ssh2 will just throw errors if connection failed, but see if there might be away to handle it through events.
  
}  

 
module.exports.connect = function(sshOptions, cb) {
  
  if (sshOptions.privateKey != '') {
    notifier.log('Private key is set, don\'t ask for password.', 'info');           
  
    connect(sshOptions, function(err) {
      cb(err);
    });  
  
  }
  else {
    notifier.log('No private key is set, use password instead.', 'info');
  
    prompt.start();
  
    var schema = {
      properties: require('./../configs/prompt/password')
    };
  
    prompt.get(schema, function (err, results) {
  
      if (err) {
        cb(err);
      }
      else {
                  
        var password = results.password;
        sshOptions.password = password;
  
        connect(sshOptions, function(err) {
          cb(err);
        });  
        
      }
    });
  }  
}; 

function disconnect() {
  if (ssh !== null) {
    ssh.end();
    ssh = null;
  }    
}

module.exports.disconnect = disconnect;
  
module.exports.runTask = function(task, taskType, projectConfig, cb) {

  var runtime = getRuntime(projectConfig.runtime)
    , hook = runtime[commandGroup.name][commandGroup.value].hook;

  projectConfig.task = projectConfig.tasks[programHandler.task];

  var commandVariables = {
    self: taskType.config,
    task: task.config,
    runtime: runtime.config,
    project: projectConfig
  };

  initCommandVariables(commandVariables);



  var $ = {
    self: taskType,
    task: task,    
    project: projectConfig,
    runtime: runtime,
    notifier: notifier,
    argv: argv,
    local: {
      packFile: function(sourcePath, targetFileName, success, failure) {
        packFile(this, sourcePath, targetFileName, success, failure);
      }.bind(this)
    },
    remote: {
      transferFile: transferFile,
      exec: ssh.exec,
      runCommands: runCommands,
      addCommandVariable: addCommandVariable
    }
  };
  
  hook($, function(err) {
    if (err) {
      cb(err);
    }
    else {
    
      runCommands(pisync, runtime[commandGroup.name][commandGroup.value].commands, function(err) {
        if (err) {
          cb(err);
        }
        else {
          cb(err);
        }
        
      });
    }
  });
  
};  


function packFile($, sourcePath, targetFileName, success, failure) {

  var fstream = require('fstream')
  , tar = require('tar-fs')
  , zlib = require('zlib')
  , target = $.projectConfig.host.tmpDir + targetFileName;

  $.notifier.log('GZIP ' + sourcePath, 'info');

  try {

    var writer = fstream.Writer({ 'path': target });

    tar.pack(sourcePath, {
      ignore: function(filePath) {
        return $.projectConfig.excludePath(filePath)
      }
    }) /* Convert the directory to a .tar file */
    .pipe(zlib.Gzip()) /* Compress the .tar file */
    .pipe(writer);
 
  }
  catch (err) {
    $.notifier.log(err, 'error');
    failure(err);
  }

  writer.on('close', function() { 
    $.notifier.log('File compressed.', 'info');
    success(target);
  });

}

function transferFile(source, target, cb) {

  var message;
  message = 'Start transfer host:/' + source + ' remote:/' + target;
    
  notifier.log(message, 'info');

  if (config.debug.active && config.debug.dontUpload) {
    notifier.log('general.debug.dontUpload set. Skip upload.', 'info');
    commandVariables.uploadedFile = target;
    cb('');
  }
  else {  

    ssh.sftp(function (err, sftp) {
      if (err) {
        notifier.log( "Error, problem starting SFTP:", 'error');
        console.log(err);
        process.exit(2);
      }
      else {

        var readStream = fs.createReadStream(source);
        var writeStream = sftp.createWriteStream(target);
  
        writeStream.on('close', function () {

          commandVariables.uploadedFile = target;
        
          notifier.log('Transfer finished.', 'success'); 
          
          cb('');

          sftp.end();
        });
  
        // initiate transfer of file
        readStream.pipe( writeStream );
        
      }
    });
  }  
}

function getCommandVariables() {
  return commandVariables;  
}

function addCommandVariable(key, value) {
  commandVariables[key] = value;
}

function initCommandVariables(projectConfig) {
      
  var variables = _.assign({}, projectConfig);
  commandVariables = variables; 
      
}

function parseVariable(variable) {

  var commandVariables = getCommandVariables()
    , path = variable.split(':')
    , value = commandVariables;

  path.forEach(function(key) {
    value = value[key];
  });

  if (typeof value === 'undefined') {
    notifier.log('Warning! ' + variable + ' undefined. Stop what I\'m doing.', 'error');
    throw '';
  }
  
  return value;  
    
}

function parseCommand(command) {

  var pattern = new RegExp(/\[(.*?)\]/)
    , match = command.match(pattern);

  while (match) {
    command = command.replace(match[0], parseVariable(match[1]));   
    match = command.match(pattern);
  }

  return command;
  
}

/*
function mergeCommands(commands, groups) {

  var arr = [];

  if (groups instanceof Array) {
    groups.forEach(function(group) {
      arr = arr.concat(commands[group]); 
    });    
  }
  else {
    arr = commands[groups];
  }
    
  return arr;
   
}*/


function getRuntime(runtime) {

  var obj = require(config.paths.runtimesDir + runtime + '/config.json')
    , commandGroupsDir = config.paths.runtimesDir + runtime + '/commandgroups/';

  obj.commandGroups = {};

  if (fs.existsSync(commandGroupsDir)) {

    fs.readdirSync(commandGroupsDir).forEach(function (folderName) {

      var commandName = folderName
        , commandGroupsValuesDir = commandGroupsDir + folderName + '/';
        
      obj.commandGroups[commandName] = {};
      
      fs.readdirSync(commandGroupsValuesDir).forEach(function (folderName) {

        var commandGroupsValueDir = commandGroupsValuesDir + folderName + '/';

        obj.commandGroups[commandName][folderName] = {
          commands: require(commandGroupsValueDir + 'commands.json'),
          hook: require(commandGroupsValueDir + 'hook')          
        };

      });
    });
    
    return obj;
        
  }
}

function runCommands(runtimeName, commands, cb) {
    
  var runtime = getRuntime(runtimeName) 
    ,  errors = false
    , command = null;
//    , commands = mergeCommands(runtime.commandGroups, commands);
  
              
  for (var i=0;i<commands.length;i++) {
    if (typeof commands[i] === 'string') { //not a command but link to another commandGroup(usually common commands like start and stop app)

      command = commands[i].split(':'); //command and value
      
      var args = [i, 1];
      args = args.concat(runtime.commandGroups[ command[0] ][ command[1] ].commands );
      Array.prototype.splice.apply(commands, args); 
 
    }
  }
    
  async.eachSeries(commands, function iterator(item, callback) {

    item.command = parseCommand(item.command);
    item.cwd = parseCommand(item.cwd);

    notifier.log('Remote: ' + item.command, 'remote');
    
    if (config.debug.active && config.debug.dontExecuteCommands) {
      notifier.log('general.debug.dontExecuteCommands set. Skip command.', 'info');
      callback();
    }
    else {

      ssh.exec(createFullCommandLine(item), function(err, stream) {
        
        if (err) {
          throw err;
        } 
        else {

          stream.on('close', function(code, signal) {
            if (!errors) {
              callback();              
            }
          }).on('data', function(data) {
            notifier.log('Remote:  ' + data, 'remote');
          }).stderr.on('data', function(data) {

            notifier.log('Remote: ' + data, 'error');

            if (item.critical) {
              errors = false;
              //cb('Critical errors when running commands on remote. Stop what I\'m doing.');
            }

          });
          
        }        
      });
      
    }
     
  }, function done() {
    cb(errors);
  });

}

function createFullCommandLine(command) {

  if (typeof command.command !== 'string') {
    throw new Error('Command must be a string')
  } 
  else if (command.cwd && typeof command.cwd !== 'string') {
    throw new Error('Cwd must be a string')
  }

  if (command.cwd) {
    return 'cd ' + shellescape([command.cwd]) + ' ; ' + command.command;
  }

  return command.command;
  
}