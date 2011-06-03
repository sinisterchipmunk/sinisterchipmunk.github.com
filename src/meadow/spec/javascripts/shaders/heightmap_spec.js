describe("Shader 'heightmap'", function() {
  var material, mesh;

  describe("stand-alone", function() {
    beforeEach(function() { mesh.material = new Jax.Material.Heightmap(); });

    it("should render without error", function() {
      expect(function() { mesh.render(SPEC_CONTEXT); }).not.toThrow();
    });
  });

  describe("as a layer", function() {
    beforeEach(function() {
      mesh.material = new Jax.Material({layers:[{
        type:"Heightmap"
      }]});
    });

    it("should render without error", function() {
      expect(function() { mesh.render(SPEC_CONTEXT); }).not.toThrow();
    });
  });
});
