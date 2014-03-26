blog.getPathObject = function(path) {
  if (typeof(path) === 'string') {
    return blog.getObjectFromPath(path);
  } else {
    return path;
  }
};

blog.containsElement = function(path, element){
  var elements = Object.keys(blog.getPathObject(path));
  for (var i = 0; i < elements.length; i++) {
    if (elements[i] === element) {
      return true;
    }
  }
  return false;
};

blog.getElementData = function(element, path) {
  return blog.containsElement(path, element) ? path[element] : null;
};

blog.getType = function(element){
  if (element === null) {
    return null;
  } else if (element === undefined) {
    return undefined;
  } else if (typeof(element) === 'string') {
    return 'string';
  } else if (typeof(element) === 'number') {
    return 'number';
  } else if (Array.isArray(element)) {
    return 'array';
  } else if (element.toString() === '[object Object]') {
    return 'object';
  } else {
    return null;
  }
};

blog.isDirEmpty = function(dir) {
  if (blog.getType(dir) !== 'object') {
    console.log("Error in blog.isDirEmpty. dir is not an object.");
    console.log("Dir: ", dir);
    return null;
  }
  return Object.keys(dir).length > 2 ? false : true;
};

blog.postApp = function(){
  var dest = blog.backendUrl + 'deploy';
  var appName = Session.get('appName');
  var appObj = blog.userFiles['/'];
  HTTP.post(dest, {data: appObj}, function(data){
    if (Session.get('userBlog') === '') {
      document.body.appendChild(Meteor.render(Template.userBlog));
    }
    var appUrl = 'http://' + appName + '.meteor.com';
    blog.addMessage("Your app has been sucessfully uploaded to " + appUrl);
    Meteor.setTimeout(function(){
      Session.set('userBlog', appUrl);
    }, 1000);
    
  });
};

blog.createFile = function(directory, fileName, contents) {
  contents = contents || '';
  directory[fileName] = contents;
  return directory[fileName];
};

blog.createDirectory = function(directory, directoryName){
  var currentPath = directory['.'];
  directory[directoryName] = {
    '.': currentPath + directoryName + '/',
    '..': currentPath
  };
  return directory[directoryName];
};

blog.showError = function (message){
  blog.addMessage("ERROR:  " + message);
};


blog.addMessage = function(message) {
  Session.push('log', message);
};

blog.setAppName = function(name) {
  Session.set('appName', name);
};


blog.getObjectFromPath = function(path) {
  var splitPath = path.split('/');

  var removeBlanks = function(array) {
    var result = [];
    for (var i = 0; i < array.length; i++) {
      if (array[i] !== '') {
        result.push(array[i]);
      }
    }
    return result; 
  };

  splitPath = removeBlanks(splitPath);

  var resultPath = blog.userFiles['/'];
  for (var i = 0; i < splitPath.length; i++) {
    resultPath = resultPath[splitPath[i]];
  }
  return resultPath;
};


// Parses a string for a command, returns command + params
blog.parseCommand = function(str){
  var endOfCommand = str.indexOf(" ");
  if (endOfCommand === -1) {
    endOfCommand = str.length;
  }
  var command = str.slice(0, endOfCommand); 

  var params = str.slice(endOfCommand + 1);
  return [command, params];
};


// Handles user input into the terminal.
blog.handleInput = function(inputStr) {
  blog.addMessage(blog.bashInput.getValue());
  var parsedCommand = blog.parseCommand(inputStr);
  var command = parsedCommand[0];
  var args = parsedCommand[1];
  blog.routeCommand(command, args);
};

// Converts an array of messages to a string for display
blog.convertMessages = function(array, target) {
  var log = array; 
  var constructedString = "";
  for (var i = 0; i < log.length; i++) {
    constructedString += '\n' + log[i];
  }
  target.setValue(constructedString);
};
