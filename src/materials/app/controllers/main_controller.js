//= require "application_controller"

var MainController = (function() {
  var ball;
  
  return Jax.Controller.create("main", ApplicationController, {
    index: function() {
      this.world.addLightSource(LightSource.find("light"));
      ball = this.world.addObject(new Jax.Model({position:[0,0,-6],mesh:new Jax.Mesh.Sphere({radius:2.0})}));
    },

    update: function(tc) {
      var speed = tc*0.25;
      ball.camera.rotate(speed, [0,1,0]);
      ball.mesh.material = this.material || "sun";
      // the sun isn't illuminated, it *is* a light source.
      if (ball.mesh.material == "sun") ball.lit = false;
      else ball.lit = true;
    }
  });
})();
