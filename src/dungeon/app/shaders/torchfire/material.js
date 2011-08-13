Jax.Material.Torchfire = Jax.Class.create(Jax.Material, {
  initialize: function($super, options) {
    options = Jax.Util.normalizeOptions(options, {
      shader: "torchfire",

      // You can specify default options (see +manifest.yml+) here.
    });
    
    this.flame_mask = new Jax.Texture({path:"/images/flame-mask.gif",flip_y:true,wrap_s:GL_CLAMP_TO_EDGE,wrap_t:GL_CLAMP_TO_EDGE});
    this.flame      = new Jax.Texture({path:"/images/flame.gif",flip_y:true,wrap_s:GL_CLAMP_TO_EDGE,wrap_t:GL_CLAMP_TO_EDGE});
    this.flame_noise= new Jax.Texture({path:"/images/flame-noise.gif",flip_y:true});

    $super(options);
  },
  
  setUniforms: function($super, context, mesh, options, uniforms) {
    $super(context, mesh, options, uniforms);

    uniforms.set('mvMatrix', context.getModelViewMatrix());
    uniforms.set('nMatrix', context.getNormalMatrix());
    uniforms.set('pMatrix', context.getProjectionMatrix());
    
    uniforms.set('time', Jax.uptime);
    Jax.noise.bind(context, uniforms);

    uniforms.texture('FlameMask', this.flame_mask, context);
    uniforms.texture('Flame', this.flame, context);
    uniforms.texture('FlameNoise', this.flame_noise, context);
  },

  setAttributes: function($super, context, mesh, options, attributes) {
    attributes.set('VERTEX_POSITION',  mesh.getVertexBuffer());
    attributes.set('VERTEX_TEXCOORDS', mesh.getTextureCoordsBuffer());
  }
});
