'use strict';

module.exports = function($, cb) {
  
  $.notifier.log('Start watching files in ' + $.projectConfig.path, 'success');

  $.watch($.projectConfig.path, $.excludePaths($.projectConfig, function(filename) {

    $.notifier.log('Change in ' + filename, 'info');

    var localPath = filename.replace($.projectConfig.path, '')
      , source = filename
      , target = $.projectConfig.remote.projectsDir + $.projectConfig.id + '/' + localPath;

    $.remote.transferFile(source, target, function(err) {

      if (err) {
        $.notifier.log(err, 'error');
      }
      else {

        var commandGroups = [];

        var mainFilePath = $.projectConfig.remote.projectsDir + $.projectConfig.id + '/' + $.projectConfig.main;

        if (target === mainFilePath) {
          commandGroups.push('setTitle');  
        }
        
        commandGroups.push('watch');
        
        $.remote.runCommands($.projectConfig.runtime, commandGroups, function(err) {
          if (err) {
            $.notifier.log(err, 'error');
          }
          else {
            $.notifier.log('Remote ready.', 'success');
          }
          
        });              
        
      }
      
    });
    
  }));
  
  $.remote.runCommands($.projectConfig.runtime, $.runtime.commandGroups[$.commandGroup.name][$.commandGroup.value], function(err) {
    if (err) {
      cb(err);
    }
    else {

    }
    
  });  
    
};