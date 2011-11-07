describe "Torchfire", ->
  model = null
  
  describe "defaults", ->
    beforeEach ->
      model = new Torchfire()
      
  
  it "should instantiate without errors", ->
    expect(-> new Torchfire()).not.toThrow()
  