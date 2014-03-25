if (Meteor.isClient) {
  var generalInit = function(){
    // Create namespace
    window.blog = {};
    blog.command = {};
    blog.meteor = {};
    blog.userFiles = {'/' : {'.': '/', '..': ''}};
    blog.currentDirectory = blog.userFiles['/'];
    // Define helpers
    
    // Command helpers
    
    // outputs the args it's passed
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
      if (currentDirectory[fileName] === undefined) {
        currentDirectory[fileName] = '';
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
      blog.addMessage(pathContents.sort());
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
        "Do not expect full functionality, and generally try to use them at their most basic level.)" +
        "\nAvailable Commands: " +
        "\n  General:" +
        "\n          ls                       : Displays the contents of the current directory." +
        "\n          cd                       : Change current directory to specified directory. (use '..' for parent directory)" +
        "\n          pwd                      : Displays the current path." +
        "\n          mkdir (directory_name)   : Creates a new directory in the current directory." +
        "\n   Meteor:" +
        "\n          meteor create (app_name) : Creates a new meteor app in the root directory."

      );
    }

    // Meteor simulation commands
    blog.meteor.create = function(name) {
      name = name.replace(/\W+/g, "_");
      var sessionAppName = Session.get('appName');
      if (sessionAppName === '') {
        blog.setAppName(name);
        var appDir = blog.createDirectory(blog.userFiles['/'], name);
        blog.createFile(appDir, name + '.js');
        blog.createFile(appDir, name + '.html');
        blog.createFile(appDir, name + '.css');
        blog.addMessage(name + ": created.\nTo deploy your new app:\n  cd " + name + "\n  meteor deploy " + name + ".meteor.com");
      }
      else {
        blog.addMessage("ERROR:  Meteor directory has already been created!");
      }
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

    blog.meteor.routeCommand = function(commandArgs) {
      commandArgs = blog.parseCommand(commandArgs);
      var command = commandArgs[0];
      var args = commandArgs[1] || '';

      var commandMapping = {
        create: blog.meteor.create
      };

      var mappedCommand = commandMapping[command] || null;

      if (mappedCommand !== null) {
        return mappedCommand.call(null, args);
      }
      else {
        blog.addMessage("ERROR: Command not recognized.");
      }
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

    // Looksup a function to send a command to
    blog.routeCommand = function(command, params) {
      params = params || '';
      var commandMapping = {
        echo: blog.command.echo,
        mkdir: blog.command.mkdir,
        ls: blog.command.ls,
        cd: blog.command.cd,
        pwd: blog.command.pwd,
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

    // Defines a way to easily push to arrays in session variables
    Session.push = function(id, value) {
      var sessionArray = Session.get(id);
      sessionArray.push(value);
      Session.set(id, sessionArray);
    };

    var setupSessions = function() {
      Session.setDefault('log', []);
      Session.setDefault('appName', "");
    };
    var createShell = function(target) {
      blog.bashInstructions = CodeMirror(target, {
        //value: "sudo curl https://install.meteor.com | /bin/sh",
        value: "test",
        mode:  "shell",
        theme: "3024-night",
        readOnly: "nocursor"
      });
      blog.bashInput = CodeMirror(target, {
        //value: "sudo curl https://install.meteor.com | /bin/sh",
        mode:  "shell",
        theme: "3024-night",
        autofocus: true, 
        extraKeys: {
          "Enter": function() {
            blog.handleInput(blog.bashInput.getValue());
            blog.bashInput.setValue("");
          }
        }
      });

      // Style the shells
      blog.bashInstructions.setSize("100%", "5%");
      blog.bashInput.setSize("100%", "5%");

      // Setup Deps events

      // Events to run when log is updated
      Deps.autorun(function(){
        var log = Session.get('log');
        var lastCommand = log[log.length - 1];

        //blog.parseCommand(lastCommand);
        blog.convertMessages(log, blog.bashInstructions);
      });
    }
    setupSessions();
    createShell(document.body);
  };

  // Run startup sequence
  Meteor.startup(generalInit);
}


if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
