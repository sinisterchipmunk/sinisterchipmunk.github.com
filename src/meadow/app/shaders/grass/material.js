Jax.Material.Grass = Jax.Class.create(Jax.Material, {
  initialize: function($super, options) {
    options = Jax.Util.normalizeOptions(options, {
      shader: "grass",

      // You can specify default options (see +manifest.yml+) here.
    });

    $super(options);
  },
  
  setUniforms: function($super, context, mesh, options, uniforms) {
    $super(context, mesh, options, uniforms);

    this.cam = this.cam || vec3.create();
    
    uniforms.set('mvMatrix', context.getModelViewMatrix());
    uniforms.set('nMatrix', context.getNormalMatrix());
    uniforms.set('pMatrix', context.getProjectionMatrix());
    uniforms.set('imvMatrix', context.getInverseModelViewMatrix());
    uniforms.set('objSpaceCamPos', mat4.multiplyVec3(context.getInverseModelViewMatrix(), this.cam));
    
    uniforms.set('TIME', Jax.uptime);

    this.noise = this.noise || new Jax.Noise(context);
    uniforms.texture('permTexture',    this.noise.perm,    context);
    uniforms.texture('simplexTexture', this.noise.simplex, context);
    uniforms.texture('gradTexture',    this.noise.grad,    context);
  },

  setAttributes: function($super, context, mesh, options, attributes) {
    attributes.set('VERTEX_POSITION',  mesh.getVertexBuffer());
    attributes.set('VERTEX_COLOR',     mesh.getColorBuffer());
    attributes.set('VERTEX_NORMAL',    mesh.getNormalBuffer());
    attributes.set('VERTEX_TEXCOORDS', mesh.getTextureCoordsBuffer());

    if (mesh.grass_positions) attributes.set('OBJECT_POSITION', mesh.grass_positions);
  }
});
