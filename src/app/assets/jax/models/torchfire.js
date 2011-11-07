/* Particle generator to render torch fires. All torches in the scene will be rendered in 1 pass. */
Jax.getGlobal()['Torchfire'] = Jax.Model.create({
  after_initialize: function() {
    var self = this;
    this.emitters = [];
    this.mesh = new Jax.Mesh({
      material: "torchfire",
      
      init: function(vertices, colors, texcoords) {
        for (var i = 0; i < self.emitters.length; i++) {
          var p = self.emitters[i];
          var s = 0.05, sy = s * 2;
          vertices.push(p[0]-s, p[1]+sy, p[2]-s);
          vertices.push(p[0]-s, p[1]-s,  p[2]-s);
          vertices.push(p[0]+s, p[1]-s,  p[2]+s);
          vertices.push(p[0]-s, p[1]+sy, p[2]-s);
          vertices.push(p[0]+s, p[1]-s,  p[2]+s);
          vertices.push(p[0]+s, p[1]+sy, p[2]+s);
          
          texcoords.push(0, 1);
          texcoords.push(0, 0);
          texcoords.push(1, 0);
          texcoords.push(0, 1);
          texcoords.push(1, 0);
          texcoords.push(1, 1);

          vertices.push(p[0]+s, p[1]+sy, p[2]-s);
          vertices.push(p[0]+s, p[1]-s,  p[2]-s);
          vertices.push(p[0]-s, p[1]-s,  p[2]+s);
          vertices.push(p[0]+s, p[1]+sy, p[2]-s);
          vertices.push(p[0]-s, p[1]-s,  p[2]+s);
          vertices.push(p[0]-s, p[1]+sy, p[2]+s);

          texcoords.push(1, 1);
          texcoords.push(1, 0);
          texcoords.push(0, 0);
          texcoords.push(1, 1);
          texcoords.push(0, 0);
          texcoords.push(0, 1);
        }
      }
    });
  },
  
  render: function($super, context, options) {
    context.glEnable(GL_BLEND);
    context.glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    $super(context, Jax.Util.normalizeOptions(options, {material:"torchfire"}));
  },
  
  addEmitter: function(emitter) {
    this.emitters.push(emitter);
  }
});
