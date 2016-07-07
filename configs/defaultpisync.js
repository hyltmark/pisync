pis task runtime device1,device2,device3,device4

module.exports = function(pis) {

  var profile = pis.addProfile('node',
    {
      "path": "/Users/winstonhades/iot/treadmill-client",
      "tmpDir": '/Users/winstonhades/iot/treadmill-client/tmp',
      "excludePaths": [
        ".git"
      ],
      "default": true,
      "help": {
        "title": "NodeJS Profile",
        "description": "NodeJS Profile"
      }
    }
  );

  profile.setRuntime({
    "runtime": "node",
    "main": "app.js",
    "arguments": "",
    "help": {
      "title": "NodeJS",
      "description": "NodeJS runtime"
    }
  });

  var task = profile.addTask({
    "watch": {
      "pisync": {
        
      },
      "help": {
        "description": "Start in shell",
        "arguments": {
          "s": "Stop first"
        }
      },
      "commands": [],
      "hook": function($, callback) {callback(err, {runCommands: false})},
      "options": {
        "background": {
          "help": {
            "description": "open in background"
          },
          "commands": [],
          "hook": function($, callback) {callback(err, {runCommands: false})},
        }
      }
    }
  }, 'watch');

  task.addTasks({});

  task = profile.getTask('watch');

  task.addHook('preHook', function(api, callback) { //preHook, postHook, preCommand, postCommand

  });

  profile.addCollection(require('pisync-node-collection')); //runtime and tasks.

  profile.removeGlobalDevices();

  profile.addDevice({
    'host': '0.0.0.0',
    'port': 22,
    'username': 'pi',
    'privateKey': '/Users/userName/.ssh/pi',
    'passphrase': '',
    "promtForPassphrase": false,        //your passphrase is blank, should I prompt for passphrase upon connect? Default: No
    'projectsDir': '/home/pi/iot/',
    'tmpDir': '/home/pi/iot/tmp/'
  });
  profile.addDevices();

};

//fix so that whatever reads this config outputs a nice javascript object for pisync to use. 