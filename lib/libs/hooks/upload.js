'use strict';

module.exports = function($, cb) {

  $.notifier.log('Begin upload', 'info');

  var fstream = require('fstream')
  , tar = require('tar-fs')
  , zlib = require('zlib')
  , fileName = $.projectConfig.id + '.gz'    
  , source = $.projectConfig.host.tmpDir + fileName;
    
  $.notifier.log('GZIP ' + source, 'info');
    
  try {   

    var writer = fstream.Writer({ 'path': source });

    tar.pack($.projectConfig.path, {
      ignore: function(filePath) {
        return $.projectConfig.excludePath(filePath)
      }
    }) /* Convert the directory to a .tar file */
    .pipe(zlib.Gzip()) /* Compress the .tar file */
    .pipe(writer);
 
  }
  catch (err) {
    $.notifier.log(err, 'error');
    cb(err);
  }

  writer.on('close', function() { 

    $.notifier.log('File compressed.', 'info');

    var target = projectConfig.remote.tmpDir + fileName;
        
    $.remote.transferFile(ssh, source, target, function(err) {
      cb(err);      
    });
  
  });

};