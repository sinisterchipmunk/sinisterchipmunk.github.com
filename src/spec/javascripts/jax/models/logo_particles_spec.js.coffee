describe "LogoParticles", ->
  model = null
  
  describe "defaults", ->
    beforeEach ->
      model = new LogoParticles()
      
  
  it "should instantiate without errors", ->
    expect(-> new LogoParticles()).not.toThrow()
  