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
  
  setVariables: function(context, mesh, options, vars) {

    vars.set('mvMatrix', context.getModelViewMatrix());
    vars.set('nMatrix', context.getNormalMatrix());
    vars.set('pMatrix', context.getProjectionMatrix());
    
    vars.set('time', Jax.uptime);
    Jax.noise.bind(context, vars);

    vars.texture('FlameMask', this.flame_mask, context);
    vars.texture('Flame', this.flame, context);
    vars.texture('FlameNoise', this.flame_noise, context);

    vars.set('VERTEX_POSITION',  mesh.getVertexBuffer());
    vars.set('VERTEX_TEXCOORDS', mesh.getTextureCoordsBuffer());
  }
});
