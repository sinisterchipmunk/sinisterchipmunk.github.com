//= require "application_controller"

var HatchController = (function() {
  return Jax.Controller.create("hatch", ApplicationController, {
    index: function() {
      this.teapot = 
      // this.world.addObject(new Jax.Model({position:[0,0,-9],mesh:new Jax.Mesh.Teapot({size:4,material:"tamhatch"})}));
      this.world.addObject(new Jax.Model({position:[0,0,-9],mesh:new Jax.Mesh.Teapot({size:4})}));
      
      this.light = new Jax.Scene.LightSource({
        type: Jax.POINT_LIGHT,
        position: [5,0,-5],
        attenuation: { linear: 0.25 }
      });
      this.world.addLightSource(this.light);

     // this.world.addObject(new Jax.Model({position:[0,0,0],mesh:new Jax.Mesh.Cube({size:40,material:"hatch"})}));
    },

    
    // Some special actions are fired whenever the corresponding input is
    // received from the user.
    mouse_dragged: function(event) {
      this.teapot.camera.rotate(0.1, [event.diffy, event.diffx, 0]);
     // this.light.camera.move(event.diffy / 75);
     // this.light.camera.strafe(event.diffx / 75);
    }
  });
})();
