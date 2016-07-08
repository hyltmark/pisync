'use strict';

var executedCommand = null
  , colour = require('colour')
  , options = null;

module.exports.loadCommands = function(commandsConfigPath) {

  var commandsConfig = require(commandsConfigPath);

  var argv = require('minimist')(process.argv.slice(2));

  options = argv;

  if (argv.hasOwnProperty('h') && (argv.h)) {
    outputHelp(commandsConfig);
  } 

  var command = null;
    
  if (argv._.length && (Object.keys(commandsConfig).indexOf(argv._[0]) > -1)) {
    command = {name: argv._[0], value: ''};
  }
  else {
    outputHelp(commandsConfig);
  }

  if (argv._.length>1) {
    command.value = argv._[1];
  }
  
  executedCommand = command;
    
  //no command executed, exit.
  if (executedCommand === null) {
    process.exit();
  }  
  
};

module.exports.getOptions = function() {
  return options;
};

function outputHelp(commandsConfig) {

  var columnify = require('columnify');

  console.log('\nPi Sync! Happy to serve.'.red);
  console.log('\nUsage: app [options] [command] \n\n\ '.green);
  
  var columns = [];
           
  Object.keys(commandsConfig).forEach(function(key) {  

    var command = commandsConfig[key];
  
    var str = key
      , values = '';
  
    command.values.forEach(function(value) {
  
      if (values.length) {
        value = '|' + value;
      }
  
      values += value;          
  
    });

    if (values.length) {
      str = str + ' [' + values + ']';
    }

    columns.push(
      {
        command: str,
        description: command.description      
      }
    );

  });  

  var output = columnify(columns);
 
  console.log(output.cyan);
  
  console.log('\n\nAll commands should be executed inside the project folder you want to sync.\n '.yellow);
    
}

module.exports.getExecutedCommand = function() {
  return executedCommand;
}