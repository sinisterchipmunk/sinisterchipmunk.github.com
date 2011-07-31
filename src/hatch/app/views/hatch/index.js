Jax.views.push('hatch/index', function() {
  // this.glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  // this.world.render();

  var self = this;
  
  // prep framebuffer
  self.buf = self.buf || new Jax.Framebuffer({
    width:self.context.canvas.width,
    height:self.context.canvas.height,
    depth: true,
    color: GL_RGBA
  });
  
  // render scene to framebuffer
  self.buf.bind(self.context, function() {
    // self.buf.viewport(self.context);
    self.glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    self.world.render();
  });
  // don't need this since framebuffer size == canvas size
  // self.context.glViewport(0, 0, self.context.canvas.width, self.context.canvas.height);
  
  // clear the canvas
  self.glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  
  // prep ortho view
  var ortho = self.ortho = self.ortho || ((function() {
    var mat = mat4.create();
    mat4.ortho(-0.5,0.5,  -0.5,0.5,  0.1,10.0,  mat);
    return mat;
  })());
  
  // load ortho view, reset model matrix, and render a big, textured rectangle
  // using framebuffer as the texture and xhatch for shader
  self.context.loadProjectionMatrix(ortho);
  self.context.loadModelMatrix(mat4.IDENTITY);
  self.quad = self.quad || new Jax.Model({
    mesh:new Jax.Mesh.Quad({
      size:1.0,
      material: "xhatch"
    }),
    position:[0,0,-5]
  });
  self.quad.render(self.context, {fbuf:self.buf});
});
