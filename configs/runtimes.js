'use strict';

module.exports = {
    'commands': {      
      'startShell': [
        {
          critical: false,
          cwd: '[remote:projectsDir][id]',
          command: 'node [main] [arguments]'
        }        
      ],
      'startBackground': [
        {
          critical: false,
          cwd: '[remote:projectsDir][id]',
          command: 'pm2 start [main] --node-args="[arguments]"'
        }        
      ],
      'stopShell': [
        {
          critical: false,
          cwd: '[remote:projectsDir][id]',
          command: 'killall -9 [id]'
        }        
      ],
      'stopBackground': [
        {
          critical: false,
          cwd: '[remote:projectsDir][id]',
          command: 'pm2 stop [main]'
        }
      ],
      'autostart': [
        'startBackground',
        {
          critical: true,
          cwd: '[remote:projectsDir][id]',
          command: 'sudo pm2 save'
        }
      ],
      'setTitle': [
        {
          critical: true,
          cwd: '[remote:projectsDir]',          
          command: 'sed -i \'1 i\\process.title = "[id]";\' [remote:projectsDir][id]/[main]'
        }
      ] 
    }      
  }
};