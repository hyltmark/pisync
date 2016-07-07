module.exports.excludePaths = function(fn) {
  return function(filename) {   
    if (!this._.excludePath(filename)) {
      fn(filename);
    }
  }.bind(this);
}


module.exports.excludePath = function(filename) {

  var exclude = false;
  
  this.excludePaths.forEach(function(path) {
      
    path = this.path + path;
    
    if (filename.substr(0, path.length) === path) {
      exclude = true;
    }
    
  }.bind(this));
  
  return exclude;  
}