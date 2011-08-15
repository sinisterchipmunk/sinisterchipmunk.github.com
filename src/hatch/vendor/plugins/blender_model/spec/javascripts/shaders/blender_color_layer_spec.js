describe("Shader 'blender_color_layer'", function() {
  var material, mesh;

  beforeEach(function() { mesh = new Jax.Mesh.Quad(); });

  describe("stand-alone", function() {
    it("should raise an error because the shader cannot be used standalone", function() {
      expect(function() {
        mesh.material = new Jax.Material.BlenderColorLayer();
      }).toThrow();
    });
  });

  describe("as a layer", function() {
    beforeEach(function() {
      var dataRegion = new Jax.DataRegion();
      mesh.material = new Jax.Material({layers:[{
        type:"BlenderColorLayer",
        dataBuffer:new Jax.DataBuffer(GL_ARRAY_BUFFER, dataRegion.map(Float32Array, [1,1,1,1,1,1,1,1,1,1,1,1]), 3)
      }]});
    });

    it("should render without error", function() {
      expect(function() { mesh.render(SPEC_CONTEXT); }).not.toThrow();
    });
  });
});
