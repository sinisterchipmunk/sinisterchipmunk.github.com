Jax.Material.Skybox = Jax.Class.create(Jax.Material, {
  initialize: function($super, options) {
    options = Jax.Util.normalizeOptions(options, {
      shader: "skybox",

      // You can specify default options (see +manifest.yml+) here.
    });

    $super(options);
  },
  
  setVariables: function(context, mesh, options, vars) {
    vars.set('mvMatrix', context.getModelViewMatrix());
    vars.set('nMatrix', context.getNormalMatrix());
    vars.set('pMatrix', context.getProjectionMatrix());

    vars.set('TIME', Jax.uptime);

    Jax.noise.bind(context, vars);

    vars.set('VERTEX_POSITION',  mesh.getVertexBuffer());
    vars.set('VERTEX_COLOR',     mesh.getColorBuffer());
    vars.set('VERTEX_NORMAL',    mesh.getNormalBuffer());
    vars.set('VERTEX_TEXCOORDS', mesh.getTextureCoordsBuffer());
  }
});
