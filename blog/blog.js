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
      Session.setDefault('commandHistory', []);
      Session.setDefault('appName', "");
      Session.setDefault('userBlog', "");
      Session.setDefault('userBlogStyle', "");
      Session.setDefault('textBuffers', {});
    };

    var createShell = function(target) {
      blog.bashInstructions = CodeMirror(target, {
        value: "test",
        mode:  "shell",
        theme: "3024-night",
        readOnly: "nocursor"
      });
      blog.bashInput = CodeMirror(target, {
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
      blog.bashInstructions.getWrapperElement().onclick = function(){
        blog.bashInput.focus();
      };
      blog.bashInstructions.setSize("100%", "320px");
      blog.bashInput.setSize("100%", "5%");

      // Setup Deps events

      // Events to run when log is updated
      Deps.autorun(function(){
        var log = Session.get('log');
        var lastCommand = log[log.length - 1];

        //blog.parseCommand(lastCommand);
        blog.convertMessages(log, blog.bashInstructions);
        blog.bashInstructions.setCursor(blog.bashInstructions.lineCount());
      });
    }
    setupSessions();
    createShell(document.getElementById('console'));
  };

  // Run startup sequence
  Meteor.startup(generalInit);
  Meteor.startup(blog.command.welcome);
}
