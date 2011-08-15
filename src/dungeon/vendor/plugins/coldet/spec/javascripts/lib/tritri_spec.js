describe("tritri", function() {
  xit("should return false", function() {
    var mesh = new Jax.Mesh.Sphere({slices:4,stacks:4,radius:0.5});
    
    var cam = new Jax.Camera();
    cam.setPosition([0,3,0]);
    var matrix = cam.getTransformationMatrix();
    
    var tris = mesh.getTriangles();
    var tri2 = new Jax.Geometry.Triangle();
    var a = vec3.create(), b = vec3.create(), c = vec3.create();
    for (var i = 0; i < tris.length; i++) {
      for (var j = 0; j < tris.length; j++) {
        mat4.multiplyVec3(matrix, a, a);
        mat4.multiplyVec3(matrix, b, b);
        mat4.multiplyVec3(matrix, c, c);
        tri2.set(a, b, c);
        
        expect(tris[i].intersectTriangle(tri2)).toBeFalsy();
      }
    }
  });
});
