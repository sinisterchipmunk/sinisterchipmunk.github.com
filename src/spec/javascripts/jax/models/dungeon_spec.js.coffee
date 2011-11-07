describe "Dungeon", ->
  model = null
  
  describe "defaults", ->
    beforeEach ->
      model = new Dungeon()
      
  
  it "should instantiate without errors", ->
    expect(-> new Dungeon()).not.toThrow()
  