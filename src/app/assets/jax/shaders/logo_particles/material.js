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
  
  setVariables: function(context, mesh, options, vars) {
    vars.set('mvMatrix', context.getModelViewMatrix());
    vars.set('nMatrix', context.getNormalMatrix());
    vars.set('pMatrix', context.getProjectionMatrix());

    vars.texture('logo', this.logoTexture, context);
    vars.set('scale', this.scale);
    
    var time = options.startedAt != undefined ? Jax.uptime - options.startedAt : Jax.uptime;
    vars.set('time', time);

    vars.set('TEXTURE_COORDS',  mesh.getVertexBuffer());
  }
});
