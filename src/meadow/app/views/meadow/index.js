Jax.views.push('meadow/index', function() {
  this.glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  this.world.render();
  
  // this.quad = this.quad || new Jax.Model({position:[0,0,-2],
  //                                         mesh:new Jax.Mesh.Quad({material:Material.find("grass")})});
  // this.quad.render(this.context);
});
