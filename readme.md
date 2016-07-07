CAUTION, USE AT YOUR OWN RISK
This application will execute shell commands on your remote machine. 
Altough they have been tested and working on my Raspberry PI.
I suggest that you go through all commands that are executed on remote, 
in "./configs/runtimes.json" before you start using this application.

Requirements
  Runtime JS   
    On remote: 
      Only required if you need start/stop [background] (run in background) or autostart
        - Install https://github.com/Unitech/pm2
        - sudo pm2 startup

Supported Runtimes
  -NodeJS
  -Add more. See appendix.

Use Guide (OSX)
    
  1. Install pisync globally: "npm install -g ./".  
  2. Go to your project. Run "pis init".
  3. "./pisync.json" has been created in the root folder of your project. Add missing details in this file.
  5. For passwordless login: Add your public key to the Raspberry PI authorized_keys. See Appendix for help. 
  5. Go!

COMMANDS
  Run "pis -h"
  
APPENDIX
 
  Add public key to the Raspberry PI
    1. Create rsa key: https://www.drupal.org/node/1070130
    2. Copy key to the Raspberry PI:
      -https://github.com/beautifulcode/ssh-copy-id-for-OSX
      OR MANUALLY:
      -http://mpolaczyk.pl/raspberry-pi-series-part-2-ssh-public-key-authentication/
      
      

  Add more runtimes
    1. Add runtime in ./configs/runtime.js
    2. Add commands in ./configs/commandgroups/newruntime/ (See node/ as example)      
    
    
      var $ = {
    projectConfig: projectConfig,
    notifier: notifier,    
    remote: {
      transferFile: transferFile,
      exec: ssh.exec,
      runCommands: runCommands      
    }

  };
