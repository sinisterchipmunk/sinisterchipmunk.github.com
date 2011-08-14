Jax.Material.Hatch = Jax.Class.create(Jax.Material, {
  initialize: function($super, options) {
    options = Jax.Util.normalizeOptions(options, {
      shader: "hatch",

      // You can specify default options (see +manifest.yml+) here.
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
  
  setUniforms: function($super, context, mesh, options, uniforms) {
    $super(context, mesh, options, uniforms);

    uniforms.set('mvMatrix', context.getModelViewMatrix());
    uniforms.set('nMatrix', context.getNormalMatrix());
    uniforms.set('pMatrix', context.getProjectionMatrix());

    for (var i = 0; i < 6; i++) {
      uniforms.texture('hatch'+i, this.tam[i], context);
    }
    // uniforms.texture('Texture', this.texture, context);
  },

  setAttributes: function($super, context, mesh, options, attributes) {
    attributes.set('VERTEX_POSITION',  mesh.getVertexBuffer());
    attributes.set('VERTEX_COLOR',     mesh.getColorBuffer());
    attributes.set('VERTEX_NORMAL',    mesh.getNormalBuffer());
    attributes.set('VERTEX_TEXCOORDS', mesh.getTextureCoordsBuffer());
  }
});
