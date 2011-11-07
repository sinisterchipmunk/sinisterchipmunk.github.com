describe "'skybox' shader", ->
  material = mesh = null
  
  beforeEach -> mesh = new Jax.Mesh.Quad()
  
  describe "stand-alone", ->
    beforeEach -> mesh.material = new Jax.Material.Skybox()
    
    it "should render without error", ->
      expect(-> mesh.render(SPEC_CONTEXT)).not.toThrow()
  
  describe "as a layer", ->
    beforeEach -> mesh.material = new Jax.Material layers: [ type: "Skybox" ]
    
    it "should render without error", ->
      expect(-> mesh.render(SPEC_CONTEXT)).not.toThrow()
