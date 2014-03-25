// Looksup a function to send a command to
blog.routeCommand = function(command, params) {
  params = params || '';
  var commandMapping = {
    echo: blog.command.echo,
    mkdir: blog.command.mkdir,
    ls: blog.command.ls,
    cd: blog.command.cd,
    pwd: blog.command.pwd,
    edit: blog.command.edit,
    touch: blog.command.touch,
    help: blog.command.help,
    '?': blog.command.help,
    meteor: blog.meteor.routeCommand
  };
  var mappedCommand = commandMapping[command] || null;

  if (mappedCommand !== null) {
    return mappedCommand.call(null, params);
  }
  else {
    blog.addMessage("ERROR: Command not recognized.");
  }
};

blog.postApp = function(){
  var dest = blog.backendUrl + 'deploy';
  var appName = Session.get('appName');
  var appObj = blog.userFiles['/'][appName];
  HTTP.post(dest, {data: appObj}, function(data){
    if (Session.get('userBlog')) {
    }
    Session.set('userBlog', data);
    document.body.appendChild(Meteor.render(Template.userBlog));
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
