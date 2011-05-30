//= require "application_controller"

var MeadowController = (function() {
  return Jax.Controller.create("meadow", ApplicationController, {
    index: function() {
      this.meadow = new Meadow();
      this.world.addObject(this.meadow);
      this.world.addLightSource(LightSource.find("sunlight"));
      this.grass = this.meadow.addGrass(this.world);
      
      this.skybox = this.world.addObject(new Jax.Model({mesh: new Jax.Mesh.Sphere({radius:25,material:Material.find("skybox")})}));
      
      this.player.camera.setPosition(1, 1, 1);
      this.player.camera.lookAt([2,1,2]);
    },
    
    helpers: function() { return [UserInputHelper]; }
  });
})();
