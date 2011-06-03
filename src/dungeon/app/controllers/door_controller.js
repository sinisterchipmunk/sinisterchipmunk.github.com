//= require "application_controller"

/* Just some tests for the door. */

var DoorController = (function() {
  return Jax.Controller.create("door", ApplicationController, {
    index: function() {
      this.door = new Door({position:[0,0,-5]});
      this.world.addObject(this.door);
    },
    
    mouse_moved: function(m) {
      if (this.world.pick(m.x, m.y)) this.door.highlight();
      else this.door.unhighlight();
    }
  });
})();
