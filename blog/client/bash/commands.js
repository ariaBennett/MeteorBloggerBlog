// routes parsed input from console to appropriate commands
blog.routeCommand = function(command, params) {
  params = params || '';
  var commandMapping = {
    echo: blog.command.echo,
    mkdir: blog.command.mkdir,
    ls: blog.command.ls,
    cd: blog.command.cd,
    rm: blog.command.rm,
    pwd: blog.command.pwd,
    edit: blog.command.edit,
    touch: blog.command.touch,
    help: blog.command.help,
    '?': blog.command.help,
    welcome: blog.command.welcome,
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

blog.command.rm = function(target) {
  var targetData = blog.getElementData(target, blog.currentDirectory);
  var targetType = blog.getType(targetData);
  if (targetType === null) {
    blog.showError("That file is not recognized")
  } else if (target[0] === '.') {
    blog.showError("You are not allowed to delete directory sub-data directly");
  } else if (targetType === 'string') {
    delete blog.currentDirectory[target];
    blog.addMessage(target + " deleted.");
  } else if (targetType === 'object') {
    if (blog.isDirEmpty(targetData)) {
      delete blog.currentDirectory[target];
      blog.addMessage(target + " deleted.");
    } else {
      blog.showError("Target directory is not empty; not deleting.");
    }
  } else {
    blog.showError("An unknown error has caused rm to fail.");
  }
};

blog.command.edit = function(fileName) {
  var currentDirectory = blog.currentDirectory;
  if (typeof(currentDirectory[fileName]) === 'string') {
    var filePath = currentDirectory['.'] + fileName;
    var textBuffers = Session.get('textBuffers');
    if (textBuffers[filePath] === undefined) {
      var bufferEditor = CodeMirror(document.getElementById('console'), {
        value: currentDirectory[fileName],
        mode: "javascript",
        theme: "blackboard",
        autofocus: true,
        extraKeys: {
          "Esc": function() {
            currentDirectory[fileName] = bufferEditor.getValue();
            var tb = Session.get('textBuffers');
            tb[filePath] = undefined;
            Session.set('textBuffers', tb);
            bufferEditor.getWrapperElement().remove();
            blog.addMessage("Finished editing " + fileName + ", data saved.");
            blog.bashInput.focus();
          }
        }
      });
      bufferEditor.getWrapperElement().style.float = "left";
      bufferEditor.setSize(1/3 * 100 + "%", "49%");
      textBuffers[filePath] = true;
      Session.set('textBuffers', textBuffers);
      blog.addMessage("Now editing " + fileName + ".");
      blog.addMessage("To finish editing, press the ESC key.  Changes are saved on file close automatically.");
    } else {
      blog.showError("Requested file is already being edited.");
    }
    
  } else {
    blog.showError("File name not recognized, or it is a directory.");
  }
};

blog.command.echo = function(args) {
  blog.addMessage("echo >>> " + args);
  return args;
}

blog.command.mkdir = function(dirName) {
  dirName = dirName.replace(/\W+/g, "_");
  if (dirName === '') {
    blog.showError("Invalid directory name; not creating.");
  } else if (blog.currentDirectory[dirName] === undefined) {
    blog.createDirectory(blog.currentDirectory, dirName);
    blog.addMessage(dirName + " successfully created.");
  }
  else {
    blog.showError("A file/directory with the name " + dirName + " already exists!");
  }
}

blog.command.touch = function(fileName) {
  if (blog.currentDirectory[fileName] === undefined) {
    blog.currentDirectory[fileName] = '';
    blog.addMessage(fileName + " created.");
  }
  else {
    blog.showError("A file/directory with the name " + fileName + " already exists!");
  }
};

blog.command.ls = function() {
  var pathContents = Object.keys(blog.currentDirectory);

  var removeHidden = function(array){
    var result = [];
    for (var i = 0; i < array.length; i++){
      if (array[i][0] !== '.') {
        result.push(array[i]);
      }
    }
    return result;
  };
  pathContents = removeHidden(pathContents);

  for (var i = 0; i < pathContents.length; i++){
    if (blog.currentDirectory[pathContents[i]].toString() === "[object Object]")
      pathContents[i] = pathContents[i] + '/';
  }
  pathContents = pathContents.sort().toString();
  pathContents = pathContents.replace(/,/g, '\n');
  pathContents = pathContents === '' ? "Nothing to display; empty directory." : pathContents;
  blog.addMessage(pathContents);
};


blog.command.cd = function(args) {
  if (args.indexOf(' ') === -1) {
    if (args === '.') {
    }
    else if (args === '..') {
      blog.currentDirectory = blog.getObjectFromPath(blog.currentDirectory['..']);
    }
    else if (blog.currentDirectory[args].toString() === '[object Object]') {
      blog.currentDirectory = blog.currentDirectory[args];
    }
  }
  else {
    blog.showError("Directory not understood.");
  }
};

blog.command.pwd = function() {
  blog.addMessage(blog.currentDirectory['.']);
};

blog.command.help = function() {
  blog.addMessage(
    "(NOTE: These commands only simulate bash commands."+
    "\nDo not expect full functionality, and generally try to use them at their most basic level.)" +
    "\nAvailable Commands: " +
    "\n  General:" +
    "\n          ls                       : Displays the contents of the current directory." +
    "\n          cd (directory_name)      : Change current directory to specified directory. (use '..' for parent directory)" +
    "\n          pwd                      : Prints the current path." +
    "\n          echo (text)              : Repeats recieved text in the console." +
    "\n          edit (file_name)         : Opens a text editor on the page for the specified file." +
    "\n          touch (file_name)        : Creates an empty file in the current directory." +
    "\n          mkdir (directory_name)   : Creates a new directory in the current directory." +
    "\n          help (or ?)              : Displays this prompt." +
    "\n   Meteor:" +
    "\n          meteor create (app_name) : Creates a new meteor app in the root directory."+
    "\n                     meteor deploy : Hosts your meteor project on a server, then adds it to the page"+
    "\n   Tutorial:" +
    "\n                          tutorial : Displays the list of tutorials."+
    "\n                 tutorial (number) : Begins the chosen tutorial."+
    "\n   Misc:" +
    "\n                           welcome : Displays the welcome message"

  );
}

blog.command.welcome = function() {
  blog.addMessage(
      "                          Hey there, welcome to my interactive Meteor tutorial." +
    "\n          The purpose of this app is to provide interactive tutorials on various Meteor topics." +
    "\n            As a byproduct of building this app platform to be interactive, you can also" +
    "\n                 use it as a standalone dev enviroment for creating simple Meteor Apps." +
    "\n      Take a look at the commands offered by this app by typing \"help\" or \"?\" into this console, " +
    "\n               or you can ignore that aspect completely and simply run the tutorials below." +
    "\nAlso, if you're interested in my services as a Software Engineer, I am currently available for employment in" +
    "\n     the San Francisco area.      I can be contacted at this email address: twoplustwo@gmail.com" +
    "\n                                                                                         -Aria Bennett"+
    "\n" +
    "\n                   Commands:" +
    "\n                          tutorial 0  : Begin the first tutorial. [Installing Meteor]"+
    "\n                          help (or ?) : List available commands."+
    "\n                          tutorials   : List all available tutorials."

  );
}
