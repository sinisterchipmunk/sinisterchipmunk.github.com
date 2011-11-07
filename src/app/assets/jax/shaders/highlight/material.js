Jax.Material.Highlight = Jax.Class.create(Jax.Material, {
  initialize: function($super, options) {
    options = Jax.Util.normalizeOptions(options, {
      shader: "highlight",

      // You can specify default options (see +manifest.yml+) here.
    });

    $super(options);
  },
  
  setVariables: function(context, mesh, options, vars) {
    vars.set('mvMatrix', context.getModelViewMatrix());
    vars.set('nMatrix', context.getNormalMatrix());
    vars.set('pMatrix', context.getProjectionMatrix());

    vars.set("highlight", !!mesh.highlight);

    vars.set('VERTEX_POSITION',  mesh.getVertexBuffer());
    vars.set('VERTEX_COLOR',     mesh.getColorBuffer());
    vars.set('VERTEX_NORMAL',    mesh.getNormalBuffer());
    vars.set('VERTEX_TEXCOORDS', mesh.getTextureCoordsBuffer());
  }
});
