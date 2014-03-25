blog.meteor.routeCommand = function(commandArgs) {
  commandArgs = blog.parseCommand(commandArgs);
  var command = commandArgs[0];
  var args = commandArgs[1] || '';

  var commandMapping = {
    create: blog.meteor.create,
    deploy: blog.meteor.deploy
  };

  var mappedCommand = commandMapping[command] || null;

  if (mappedCommand !== null) {
    return mappedCommand.call(null, args);
  }
  else {
    blog.addMessage("ERROR: Command not recognized.");
  }
};

blog.meteor.create = function(name) {
  name = name.replace(/\W+/g, "_");
  var sessionAppName = Session.get('appName');
  if (sessionAppName === '') {
    blog.setAppName(name);
    var appDir = blog.createDirectory(blog.userFiles['/'], name);
    var defaultFiles = blog.meteor.createDefaultFiles(name);
    blog.createFile(appDir, name + '.js', defaultFiles.js);
    blog.createFile(appDir, name + '.html', defaultFiles.html);
    blog.createFile(appDir, name + '.css', defaultFiles.css);
    blog.addMessage(name + ": created.\nTo deploy your new app:\n  cd " + name + "\n  meteor deploy " + name + ".meteor.com");
  }
  else {
    blog.addMessage("ERROR:  Meteor directory has already been created!");
  }
};

blog.meteor.deploy = function() {
  var appName = Session.get('appName');
  if (appName !== "") {
    blog.postApp();
    blog.addMessage("Deploying your app, this can take up to ~30 seconds.");
    blog.addMessage("Your app will display below when it is loaded.");
  }
  else {
    blog.showError("You haven\'t created a meteor app yet! Use meteor create (app_name) first!");
  }
};

blog.meteor.createDefaultFiles = function(appName) {
  var defaultFiles = {
    js: "if (Meteor.isClient) {\n"+
    "  Template.hello.greeting = function () {\n"+
    "    return \"Welcome to " + appName + ".\";\n"+
    "  };\n"+
    "\n"+
    "  Template.hello.events({\n"+
    "    'click input': function () {\n"+
    "      // template data, if any, is available in 'this'\n"+
    "      if (typeof console !== 'undefined')\n"+
    "        console.log(\"You pressed the button\");\n"+
    "    }\n"+
    "  });\n"+
    "}\n"+
    "\n"+
    "if (Meteor.isServer) {\n"+
    "  Meteor.startup(function () {\n"+
    "    // code to run on server at startup\n"+
    "  });\n"+
    "}",

    html: "<head>\n"+
    "  <title>" + appName + "</title>\n"+
    "</head>\n"+
    "\n"+
    "<body>\n"+
    "  {{> hello}}\n"+
    "</body>\n"+
    "\n"+
    "<template name=\"hello\">\n"+
    "  <h1>Hello World!</h1>\n"+
    "  {{greeting}}\n"+
    "  <input type=\"button\" value=\"Click\" />\n"+
    "</template>",

    css: "/* CSS declarations go here */"
  }

  return defaultFiles;
};
