'use strict';

var jsonfile = require('jsonfile')
  , fs = require('fs')
  , _ = require('lodash')
  , notifier = require('../libs/notifier')
  , prompt = require('prompt')
  , projectConfig = null
  , config = require('../configs/general');

jsonfile.spaces = 2;
 
function getConfigPath() {
  
  if (config.debug.active && config.debug.useDefaultConfig) {
    return config.paths.configs.defaultPisync; 
  }
 
  return process.cwd() + '/' + config.configFileName;

} 
   
module.exports.init = function(cb) {

  fs.exists(getConfigPath(), function(exists) {
    
    console.log('checked file exists');      
    
    if (exists) {

      if (exists) {
        cb('Config file already exists at ' + getConfigPath() + '. Remove file and try again.');
      }
      
    } 
    else {
      
      var source = config.paths.configs.defaultPisync
        , target = getConfigPath();
      
      
      jsonfile.readFile(source, function(err, data) {
        
        if (err) {
          cb(err);
        }
        else {
        
          pickRuntime(function(err, runtimeConfig) {

            if (err) {
              cb(err);
            }
            else {            
              data = _.merge(data, runtimeConfig);
  
              jsonfile.writeFile(target, data, function() {
    
                if (err) {
                  notifier.log('Failed creating file ' + target, 'error');
                }
                else {
                  notifier.log('Created file ' + target, 'success');
                }
    
                cb(err);
                
              });
            }            
          });        
        }        
      });             
    }     
  });   
};

module.exports.getConfig = function(cb) {

  if (projectConfig !== null) {
    cb('', projectConfig);
  }
  else {
    fs.exists(getConfigPath(), function(exists) {
      
      if (!exists) {
        var err = 'Couldn\'t find config file. Create one by running "' + config.bin + ' init"';
        cb(err);
      }
      else {
          
        var obj = require(getConfigPath());
        
        if ((!obj.hasOwnProperty('path')) || obj.path === '') {
          obj.path = process.cwd() + '/';
        }

        var projectPathAsArray = obj.path.split('/');
    
        obj.id = (function getLastNameInPath(i) {
      
          return projectPathAsArray[i] || getLastNameInPath(i-1);
      
        })(projectPathAsArray.length-1);
    
        projectConfig = obj;    
        projectconfig._ = require('./../libs/projectconfighelpers');
      
        cb('', projectConfig);
      }    
      
    });
  } 
};

function pickRuntime(cb) {

  prompt.start();

  var schema = {
    properties: require('../configs/prompt/runtime')
  };
  
  var description = schema.properties.runtime.description;
  
  var runtimes = require('../configs/runtimes');
  var runtimeArray = [];

  Object.keys(runtimes).forEach(function(runtime) {
    description = description + '\n [' + runtimeArray.length + '] ' + runtime;
    runtimeArray.push(runtime);
  });

  schema.properties.runtime.description = description;
        
  prompt.get(schema, function (err, results) {

    if (err) {
      cb(err);
    }
    else {            
      cb(err, runtimes[runtimeArray[results.runtime]].config);
    }
    
  });

}