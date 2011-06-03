Jax.Material.Blob = (function() {
  function getNoise(self, context) {
    var noise = self.noise[context.id];
    if (!noise) noise = self.noise[context.id] = new Jax.Noise(context);
    return noise;
  }
  
  return Jax.Class.create(Jax.Material, {
    initialize: function($super, options) {
      this.u = this.v = 0.0;
      
      options = Jax.Util.normalizeOptions(options, {
        shader: "blob"
        
        // You can specify default options (see +manifest.yml+) here.
      });

      $super(options);
      this.noise = {};
    },
  
    setUniforms: function($super, context, mesh, options, uniforms) {
      $super(context, mesh, options, uniforms);

      uniforms.set('mvMatrix', context.getModelViewMatrix());
      uniforms.set('nMatrix',  context.getNormalMatrix());
      uniforms.set('pMatrix',  context.getProjectionMatrix());

      var noise = getNoise(this, context);
        
      uniforms.texture('permTexture',    noise.perm,    context);
      uniforms.texture('simplexTexture', noise.simplex, context);
      uniforms.texture('gradTexture',    noise.grad,    context);
  
      uniforms.set('time', Jax.uptime);
    },

    setAttributes: function($super, context, mesh, options, attributes) {
      attributes.set('VERTEX_POSITION',  mesh.getVertexBuffer());
      // attributes.set('VERTEX_TANGENT',   mesh.getTangentBuffer());
    }
  });
})();
