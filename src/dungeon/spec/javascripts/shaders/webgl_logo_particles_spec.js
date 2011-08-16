describe("Shader 'webgl_logo_particles'", function() {
  var material, mesh;

  beforeEach(function() { mesh = new Jax.Mesh.Quad(); });

  describe("stand-alone", function() {
    beforeEach(function() { mesh.material = new Jax.Material.WebglLogoParticles(); });

    it("should render without error", function() {
      expect(function() { mesh.render(SPEC_CONTEXT); }).not.toThrow();
    });
  });

  describe("as a layer", function() {
    beforeEach(function() {
      mesh.material = new Jax.Material({layers:[{
        type:"WebglLogoParticles"
      }]});
    });

    it("should render without error", function() {
      expect(function() { mesh.render(SPEC_CONTEXT); }).not.toThrow();
    });
  });
});
