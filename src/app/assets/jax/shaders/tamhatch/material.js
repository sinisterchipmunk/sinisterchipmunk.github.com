//= require "shaders/lighting/material"

Jax.Material.Tamhatch = Jax.Class.create(Jax.Material.Lighting, {
  initialize: function($super, options) {
    options = Jax.Util.normalizeOptions(options, {
      shader: "tamhatch",

      // You can specify default options (see +manifest.yml+) here.
    });

    $super(options);
    this.shader = "tamhatch";
    this.tam = [];
    for (var i = 1; i <= 6; i++) {
      this.tam.push(new Jax.Texture({
        min_filter: GL_LINEAR,
        mag_filter: GL_LINEAR,
        path:"/images/tam"+i+".png"
      }));
    }
  },
  
  setVariables: function($super, context, mesh, options, vars) {
    $super(context, mesh, options, vars);
    
    vars.set('mvMatrix', context.getModelViewMatrix());
    vars.set('nMatrix', context.getNormalMatrix());
    vars.set('pMatrix', context.getProjectionMatrix());

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
