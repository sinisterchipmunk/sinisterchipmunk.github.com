describe("BlenderModel", function() {
  var model;
  
  beforeEach(function() {
    model = new BlenderModel({lit:false});
  });
  
  describe("a mesh with a color layer", function() {
    beforeEach(function() {
      model.data({"TestModel":{
        vertices:[0,1,0,  -1,0,0,  1,0,0],
        colors:[[1,0,0,  0,1,0,  0,0,1]]
      }});
    });
    
    it("should add a color layer", function() {
      expect(model.mesh.colorLayers[0]).not.toBeUndefined();
      expect(model.mesh.colorLayers[0].array).toEqualVector([1,0,0,  0,1,0,  0,0,1]);
    });
    
    it("should add a blender color material layer", function() {
      expect(model.mesh.default_material.layers.length).toEqual(2);
    });
  });

  describe("an empty mesh", function() {
    beforeEach(function() {
      model.data({"TestModel":{vertices:[],colors:[],textureCoords:[],normals:[],indices:[]}});
    });

    it("does something", function() {
      expect(1).toEqual(1);
    });
  });
});
