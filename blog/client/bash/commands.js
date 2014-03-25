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
  if (blog.currentDirectory[dirName] === undefined) {
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
    "\n                     meteor deploy : Hosts your meteor project on a server, then adds it to the page"

  );
}
