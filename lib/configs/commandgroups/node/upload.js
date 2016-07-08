module.exports = { 
  'default': [
    'stop:shell',
    'stop:background',
    {
      critical: false,
      cwd: '[remote:projectsDir]',
      command: 'rm -rf [remote:projectsDir][id]'
    },
    {
      critical: true,
      cwd: '[remote:tmpDir]',
      command: 'gunzip [uploadedFile]' 
    },
    {
      critical: true,
      cwd: '[remote:tmpDir]',
      command: 'mv [remote:tmpDir][id] [remote:tmpDir][id].tar'
    },
    {
      critical: true,
      cwd: '[remote:tmpDir]',
      command: 'mkdir [remote:projectsDir][id]'
    },
    {
      critical: true,
      cwd: '[remote:tmpDir]',
      command: 'tar -xvf [remote:tmpDir][id].tar -C [remote:projectsDir][id]'
    },
    {
      critical: true,
      cwd: '[remote:tmpDir]',
      command: 'rm [remote:tmpDir][id].tar'
    },
    'setTitle'
  ] 
};