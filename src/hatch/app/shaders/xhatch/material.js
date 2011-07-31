Jax.Material.Xhatch = Jax.Class.create(Jax.Material, {
  initialize: function($super, options) {
    options = Jax.Util.normalizeOptions(options, {
      shader: "xhatch",

      // You can specify default options (see +manifest.yml+) here.
    });

    $super(options);
  },
  
  setUniforms: function($super, context, mesh, options, uniforms) {
    $super(context, mesh, options, uniforms);

    uniforms.set('mvMatrix', context.getModelViewMatrix());
    uniforms.set('nMatrix', context.getNormalMatrix());
    uniforms.set('pMatrix', context.getProjectionMatrix());
    
    if (options.fbuf) {
      uniforms.texture('sceneTex', options.fbuf.getTexture(context, 0), context);
    }

    this.noise = this.noise || new Jax.Noise(context);
    uniforms.texture('gradTexture', this.noise.grad, context);
    uniforms.texture('simplexTexture', this.noise.simplex, context);
    uniforms.texture('permTexture', this.noise.perm, context);
    
    uniforms.set('TIME', Jax.uptime);
    // uniforms.texture('Texture', this.texture, context);
  },

  setAttributes: function($super, context, mesh, options, attributes) {
    attributes.set('VERTEX_POSITION',  mesh.getVertexBuffer());
    attributes.set('VERTEX_TEXCOORDS', mesh.getTextureCoordsBuffer());
  }
});
