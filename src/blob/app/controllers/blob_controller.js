//= require "application_controller"

var BlobController = (function() {
  return Jax.Controller.create("blob", ApplicationController, {
    index: function() {
      var model = new Blob();
      this.world.addObject(model);
      this.player.camera.move(-5);
      
      var light_options = {
        type: Jax.POINT_LIGHT,
        attenuation: {
          constant: 0,
          linear: 0,
          quadratic: 0.002
        }
      };
      
      this.skybox = this.world.addObject(new Jax.Model({mesh: new Jax.Mesh.Sphere({radius:25,material:Material.find("skybox")})}));

      this.red = new LightSource(Jax.Util.normalizeOptions({
        position: [-20, 0, 20], color: { ambient: [0.2, 0, 0, 1], diffuse: [0.8, 0, 0, 1], specular:[1.0, 0, 0, 1] }
      }, light_options));
      this.world.addLightSource(this.red);

      this.green = new LightSource(Jax.Util.normalizeOptions({
        position: [ 20, 20, 20], color: { ambient: [0, 0.2, 0, 1], diffuse: [0, 0.8, 0, 1], specular:[0, 1.0, 0, 1] }
      }, light_options));
      this.world.addLightSource(this.green);

      this.blue = new LightSource(Jax.Util.normalizeOptions({
        position: [ 20, -20, 20], color: { ambient: [0, 0, 0.2, 1], diffuse: [0, 0, 0.8, 1], specular:[0, 0, 1.0, 1] }
      }, light_options));
      this.world.addLightSource(this.blue);
    },
    
    update: function(tc) {
      this.rot = (this.rot || 0) + tc * 3.0;
      
      function set(light, angle) {
        var s = Math.sin(angle), c = Math.cos(angle);
        light.camera.setPosition(s*20, c*20, 20);
      }
      var dif = Math.deg2rad(120);
      set(this.red, this.rot + dif);
      set(this.blue, this.rot + dif*2);
      set(this.green, this.rot + dif*3);

//      var s = Math.sin(this.rot/12.0), c = Math.cos(this.rot/12.0);
      this.skybox.camera.rotate(tc / 8.0, [1,1,0.5]);
//      this.player.camera.setPosition(c*5,s*5,s*5);
//      this.player.camera.lookAt([0,0,0]);
      
//      this.skybox.camera.setPosition(this.player.camera.getPosition());
    }
  });
})();
