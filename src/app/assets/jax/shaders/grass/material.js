Jax.Material.Grass = Jax.Class.create(Jax.Material, {
  initialize: function($super, options) {
    options = Jax.Util.normalizeOptions(options, {
      shader: "grass",

      // You can specify default options (see +manifest.yml+) here.
    });

    $super(options);
  },
  
  setVariables: function(context, mesh, options, vars) {
    this.cam = this.cam || vec3.create();
    
    vars.set('mvMatrix', context.getModelViewMatrix());
    vars.set('nMatrix', context.getNormalMatrix());
    vars.set('pMatrix', context.getProjectionMatrix());
    vars.set('imvMatrix', context.getInverseModelViewMatrix());
    vars.set('objSpaceCamPos', mat4.multiplyVec3(context.getInverseModelViewMatrix(), this.cam));
    
    vars.set('TIME', Jax.uptime);

    Jax.noise.bind(context, vars);

    vars.set('VERTEX_POSITION',  mesh.getVertexBuffer());
    vars.set('VERTEX_COLOR',     mesh.getColorBuffer());
    vars.set('VERTEX_NORMAL',    mesh.getNormalBuffer());
    vars.set('VERTEX_TEXCOORDS', mesh.getTextureCoordsBuffer());

    if (mesh.grass_positions) vars.set('OBJECT_POSITION', mesh.grass_positions);
  }
});
