describe "Blob", ->
  model = null
  
  describe "defaults", ->
    beforeEach ->
      model = new Blob()
      
  
  it "should instantiate without errors", ->
    expect(-> new Blob()).not.toThrow()
  