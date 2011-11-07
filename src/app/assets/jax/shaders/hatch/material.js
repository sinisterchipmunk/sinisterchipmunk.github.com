Jax.Material.Hatch = Jax.Class.create(Jax.Material, {
  initialize: function($super, options) {
    options = Jax.Util.normalizeOptions(options, {
      shader: "hatch",
      scaleU: 1,
      scaleV: 1
    });

    this.tam = [];
    for (var i = 1; i <= 6; i++) {
      this.tam.push(new Jax.Texture({
        min_filter: GL_LINEAR,
        mag_filter: GL_LINEAR,
        path:"/images/tam"+i+".png"
      }));
    }
    $super(options);
  },
  
  setVariables: function(context, mesh, options, vars) {
    vars.set('mvMatrix', context.getModelViewMatrix());
    vars.set('nMatrix', context.getNormalMatrix());
    vars.set('pMatrix', context.getProjectionMatrix());
    
    vars.set('scaleU', this.scaleU);
    vars.set('scaleV', this.scaleV);

    for (var i = 0; i < 6; i++) {
      vars.texture('hatch'+i, this.tam[i], context);
    }
    // uniforms.texture('Texture', this.texture, context);

    vars.set('VERTEX_POSITION',  mesh.getVertexBuffer());
    vars.set('VERTEX_COLOR',     mesh.getColorBuffer());
    vars.set('VERTEX_NORMAL',    mesh.getNormalBuffer());
    vars.set('VERTEX_TEXCOORDS', mesh.getTextureCoordsBuffer());
  }
});
