describe("Door", function() {
  var model;
  
  beforeEach(function() {
    model = new Door();
  });

  it("should have material 'door'", function() {
    expect(model.mesh.material).toEqual("door");
  });
  
  
  it("should highlight", function() {
    model.highlight();
    model.render(SPEC_CONTEXT);
    expect(model.mesh.material).toEqual("door_highlighted");
  });
});
