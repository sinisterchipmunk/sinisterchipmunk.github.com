var MaterialsController = (function() {
  return Jax.Controller.create("materials", ApplicationController, {
    index: function() {
      this.world.addLightSource(LightSource.find("light"));
      this.ball = this.world.addObject(new Jax.Model({position:[0,0,-6],mesh:new Jax.Mesh.Sphere({radius:2.0})}));
    },

    update: function(tc) {
      var speed = tc*0.25;
      this.ball.camera.yaw(speed);
      this.ball.mesh.material = this.material || "sun";
      // the sun isn't illuminated, it *is* a light source.
      if (this.ball.mesh.material == "sun") this.ball.lit = false;
      else this.ball.lit = true;
    }
  });
})();
