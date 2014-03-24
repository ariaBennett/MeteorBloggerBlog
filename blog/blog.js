if (Meteor.isClient) {
  var generalInit = function(){
    // Create namespace
    window.blog = {};
    blog.command = {};
    // Define helpers
    
    // Command helpers
    
    // outputs the args it's passed
    blog.command.echo = function(args) {
      blog.addMessage("echo >>> " + args);
      return args;
    }

    blog.addMessage = function(message) {
      Session.push('log', message);
    }
    
    
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
        echo : blog.command.echo
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
