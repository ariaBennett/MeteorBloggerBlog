if (Meteor.isClient) {
  var generalInit = function(){

    // Defines a way to easily push to arrays in session variables
    Session.push = function(id, value) {
      var sessionArray = Session.get(id);
      sessionArray.push(value);
      Session.set(id, sessionArray);
    };

  };

  // Run startup sequence
  Meteor.startup(generalInit);
  Meteor.startup(blog.consoleFiller);
  Meteor.startup(blog.command.welcome);
}
