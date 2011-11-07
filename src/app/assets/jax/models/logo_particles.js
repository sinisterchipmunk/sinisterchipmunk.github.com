/**
 * class LogoParticles < Jax.Model
 * 
 **/
Jax.getGlobal()['LogoParticle'] = Jax.getGlobal()['LogoParticles'] = (function() {
  return Jax.Model.create({
    after_initialize: function() {
      this.material = Jax.Material.find("webgl_logo_particles");

      var resolution = this.resolution || 1;
      var imageData = null;
      
      var canvas = document.createElement('canvas');
      var img = new Image();
      var self = this;
      img.onload = function() {
        canvas.width = self.imgWidth = img.width;
        canvas.height = self.imgHeight = img.height;
        var context = canvas.getContext('2d');
        context.drawImage(img, 0, 0);
        imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
        if (this.mesh) this.mesh.rebuild();
      };
      img.src = this.material.logo;
      
      this.mesh = new Jax.Mesh.Cube({
        default_material: "webgl_logo_particles",
        
        init: function(v) {
          if (!imageData) return;
          
          this.draw_mode = GL_POINTS;
          // 163x75 pixels, let's do a vertex per pixel.
          // But, improve performance by not doing transparent pixels.
          var mx = self.imgWidth;
          var my = self.imgHeight;
          var incr = 1 / resolution;
          for (var y = 0; y < my; y += incr) {
            for (var x = 0; x < mx; x += incr) {
              var _x = parseInt(x), _y = parseInt(y);
              if (imageData[(_y*mx+_x)*4+3] > 0) // if alpha channel is nonzero
                v.push(x / (mx-1), 1.0 - (y / (my-1)), 0);
            }
          }
        }
      });
    },
    
    start: function() {
      this.startedAt = Jax.uptime;
      this._starty = this.camera.getPosition()[1];
    },
    
    render: function($super, context, options) {
      // HACK bug in jax is applying additive blending to objects that aren't lit
      // context.glDisable(GL_BLEND);
      context.glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
      context.glDepthFunc(GL_LESS);
      
      $super(context, Jax.Util.normalizeOptions(options, {startedAt: this.startedAt}));
      context.glDepthFunc(GL_LEQUAL);
      // context.glEnable(GL_BLEND);
    }
  });
})();
