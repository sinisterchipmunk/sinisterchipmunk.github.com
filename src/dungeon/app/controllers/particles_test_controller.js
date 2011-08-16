//= require "application_controller"

var ParticlesTestController = (function() {
  return Jax.Controller.create("particles_test", ApplicationController, {
    index: function() {
      this.setupPlayer({lantern:false});
      this.particles = new LogoParticles({resolution:0.5,position:[-0.25,-0.25,-2]});
      this.world.addObject(this.particles);
    },

    update: function(tc) {
      var pos = this.movePlayer(tc);
    },
    
    helpers: [DungeonHelper]
  });
})();
