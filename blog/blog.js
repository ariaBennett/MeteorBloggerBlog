if (Meteor.isClient) {
  var generalInit = function(){

    // Defines a way to easily push to arrays in session variables
    Session.push = function(id, value) {
      var sessionArray = Session.get(id);
      sessionArray.push(value);
      Session.set(id, sessionArray);
    };

    var setupSessions = function() {
      Session.setDefault('log', []);
      Session.setDefault('appName', "");
      Session.setDefault('userBlog', "");
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
