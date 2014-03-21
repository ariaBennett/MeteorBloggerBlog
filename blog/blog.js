if (Meteor.isClient) {
  Meteor.startup(function(){
    // Define a way to easily push to arrays in session variables
    Session.push = function(id, value) {
      var sessionArray = Session.get(id);
      sessionArray.push(value);
      Session.set(id, sessionArray);
    };

    var setupSessions = function() {
      Session.setDefault('log', []);
    };
    var createShell = function(target) {
      var bashInstructions = CodeMirror(target, {
        //value: "sudo curl https://install.meteor.com | /bin/sh",
        value: "test",
        mode:  "shell",
        theme: "3024-night",
        readOnly: "nocursor"
      });
      window.bashInput = CodeMirror(target, {
        //value: "sudo curl https://install.meteor.com | /bin/sh",
        mode:  "shell",
        theme: "3024-night",
        autofocus: true, 
        extraKeys: {
          "Enter": function() {
            Session.push('log', bashInput.getValue());
            bashInput.setValue("");
          }
        }
      });


      // Style the shells
      bashInstructions.setSize("100%", "5%");
      bashInput.setSize("100%", "5%");

      // Setup Deps events
      Deps.autorun(function(){
        var log = Session.get('log');
        var constructedString = "";
        for (var i = 0; i < log.length; i++) {
          constructedString += '\n' + log[i];
        }
        bashInstructions.setValue(constructedString);
      });

    }
    setupSessions();
    createShell(document.body);
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
