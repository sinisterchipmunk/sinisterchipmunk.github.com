Jax.Material.Heightmap = Jax.Class.create(Jax.Material, {
  initialize: function($super, options) {
    options = Jax.Util.normalizeOptions(options, {
      shader: "heightmap",

      // You can specify default options (see +manifest.yml+) here.
    });

    $super(options);
  },
  
  setUniforms: function($super, context, mesh, options, uniforms) {
    $super(context, mesh, options, uniforms);

    uniforms.set('mvMatrix', context.getModelViewMatrix());
    uniforms.set('nMatrix', context.getNormalMatrix());
    uniforms.set('pMatrix', context.getProjectionMatrix());

    // uniforms.texture('Texture', this.texture, context);

    this.noise = this.noise || new Jax.Noise(context);
    uniforms.texture('permTexture',    this.noise.perm,    context);
    uniforms.texture('simplexTexture', this.noise.simplex, context);
    uniforms.texture('gradTexture',    this.noise.grad,    context);
    uniforms.set('camPos', context.player.camera.getPosition());
  },

  setAttributes: function($super, context, mesh, options, attributes) {
    attributes.set('VERTEX_POSITION',  mesh.getVertexBuffer());
    attributes.set('VERTEX_COLOR',     mesh.getColorBuffer());
    attributes.set('VERTEX_NORMAL',    mesh.getNormalBuffer());
    attributes.set('VERTEX_TEXCOORDS', mesh.getTextureCoordsBuffer());
  }
});