Jax.Material.WebglLogoParticles = Jax.Class.create(Jax.Material, {
  initialize: function($super, options) {
    options = Jax.Util.normalizeOptions(options, {
      shader: "logo_particles",
      scale: 1,
      flip_y: false
    });

    $super(options);
    
    if (this.logo) {
      this.logoTexture = new Jax.Texture({path: this.logo, flip_y:this.flip_y,
                                          wrap_s: GL_CLAMP_TO_EDGE, wrap_t: GL_CLAMP_TO_EDGE});
    } else throw new Error("'logo' property is required");
  },
  
  setUniforms: function($super, context, mesh, options, uniforms) {
    $super(context, mesh, options, uniforms);
    
    uniforms.set('mvMatrix', context.getModelViewMatrix());
    uniforms.set('nMatrix', context.getNormalMatrix());
    uniforms.set('pMatrix', context.getProjectionMatrix());

    uniforms.texture('logo', this.logoTexture, context);
    uniforms.set('scale', this.scale);
    
    var time = options.startedAt != undefined ? Jax.uptime - options.startedAt : Jax.uptime;
    uniforms.set('time', time);
  },

  setAttributes: function($super, context, mesh, options, attributes) {
    attributes.set('TEXTURE_COORDS',  mesh.getVertexBuffer());
  }
});
