Jax.Material.Highlight = Jax.Class.create(Jax.Material, {
  initialize: function($super, options) {
    options = Jax.Util.normalizeOptions(options, {
      shader: "highlight",

      // You can specify default options (see +manifest.yml+) here.
    });

    $super(options);
  },
  
  setUniforms: function($super, context, mesh, options, uniforms) {
    $super(context, mesh, options, uniforms);

    uniforms.set('mvMatrix', context.getModelViewMatrix());
    uniforms.set('nMatrix', context.getNormalMatrix());
    uniforms.set('pMatrix', context.getProjectionMatrix());

    uniforms.set("highlight", !!mesh.highlight);
    // uniforms.texture('Texture', this.texture, context);
  },

  setAttributes: function($super, context, mesh, options, attributes) {
    attributes.set('VERTEX_POSITION',  mesh.getVertexBuffer());
    attributes.set('VERTEX_COLOR',     mesh.getColorBuffer());
    attributes.set('VERTEX_NORMAL',    mesh.getNormalBuffer());
    attributes.set('VERTEX_TEXCOORDS', mesh.getTextureCoordsBuffer());
  }
});
