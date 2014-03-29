// class methods
blog.layout.parseTarget = function(target) {
  if (target !== 'visibleTemplate') {
    target = target[0] === 'r' ? target : 'region' + target ;
  }
  return target;
};

UI.body.helpers({
  visibleTemplate: function () {
    var templateName = Session.get("visibleTemplate");
    return Template[templateName] || null;
  }
});

Handlebars.registerHelper('region0', function(){
  var region = Session.get('region0');
  return Template[region] || null;
});

Handlebars.registerHelper('region1', function(){
  var region = Session.get('region1');
  return Template[region] || null;
});

Handlebars.registerHelper('region2', function(){
  var region = Session.get('region2');
  return Template[region] || null;
});

Handlebars.registerHelper('region3', function(){
  var region = Session.get('region3');
  return Template[region] || null;
});

Handlebars.registerHelper('region4', function(){
  var region = Session.get('region4');
  return Template[region] || null;
});

Handlebars.registerHelper('region5', function(){
  var region = Session.get('region5');
  return Template[region] || null;
});

Handlebars.registerHelper('region6', function(){
  var region = Session.get('region6');
  return Template[region] || null;
});

Handlebars.registerHelper('region7', function(){
  var region = Session.get('region7');
  return Template[region] || null;
});

blog.layout.applyTemplate = function(template){
  Session.set("visibleTemplate", template);
};
/*
  template = blog.layout.templates[template];
  blog.layout.set('layout', template); 
  var regions = document.getElementsByClassName('region');
  for (var i = 0; i < regions.length; i++) {
    var region = regions[i];
    var id = region.id;
    var render = Meteor.render(function(){
      return '<div>' + Session.get(id) + 'afjaiosjfioa' + '</div>';
    });
    region.appendChild(render);
  }
*/

blog.layout.get = function(target) {
  target = blog.layout.parseTarget(target);
  return Session.get(target);
};

blog.layout.set = function(target, data) {
  target = blog.layout.parseTarget(target);
  Session.set(target, data);
};
