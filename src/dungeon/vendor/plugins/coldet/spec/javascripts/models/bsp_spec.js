describe("BSP", function() {
  var bsp
  beforeEach(function() { bsp = new BSP(); });
  
  it("0.5rad Y-axis rotation hit", function() {
    bsp.addMesh(new Jax.Mesh.Cube());
    var cam = new Jax.Camera();
    cam.setPosition([1.01,0,0]);
    cam.rotate(0.5, [0,1,0]);
    
    expect(bsp.collide(bsp, cam.getTransformationMatrix())).toBeTruthy();
  });
  
  describe("with one sphere", function() {
    beforeEach(function() {
      mesh = new Jax.Mesh.Cube();
      bsp.addMesh(mesh);
      bsp.finalize();
    });
    
    it("should not have any children which exceed the bounds of any of their parents", function() {
      function node(n) {
        function children(o, callback) {
          if (o.front) callback(o.front);
          if (o.back) callback(o.back);
        }
        
        children(n, function(c) {
          // let's not worry about triangles just yet
          if (c instanceof Jax.Geometry.Triangle) return;
          
          var ns = vec3.create(n.getHalfSize());
          var cs = vec3.create(c.getHalfSize());
          vec3.add(ns, n.center, ns);
          vec3.add(cs, c.center, cs);
          
          var recurse = false;
          for (var x = 0; x < 3; x++) {
            recurse = ns[x] + Math.EPSILON > cs[x] - Math.EPSILON;
            expect(ns[x] + Math.EPSILON).toBeGreaterThan(cs[x] - Math.EPSILON);
          }
            
          if (recurse) node(c);
        });
      }
      node(bsp);
    });
  });
  
  describe("two separate BSP spheres", function() {
    var mesh, bsp1, bsp2, cam1, cam2;
    
    beforeEach(function() {
      mesh = new Jax.Mesh.Sphere();
      bsp1 = new BSP();
      bsp2 = new BSP();
      bsp1.addMesh(mesh);
      bsp2.addMesh(mesh);
      cam1 = new Jax.Camera();
      cam2 = new Jax.Camera();
    });
    
    function mat() {
      var mat = mat4.create();
      mat4.inverse(cam1.getTransformationMatrix(), mat);
      mat4.multiply(mat, cam2.getTransformationMatrix(), mat);
      return mat;
    }
    
    it("should collide", function() {
      expect(bsp1.collide(bsp2, mat())).toBeTruthy();
    });
    
    it("should collide if offset and rotated", function() {
      cam2.setPosition([0.25,0,0]);
      cam2.yaw(1);
      expect(bsp1.collide(bsp2, mat())).toBeTruthy();
    });
    
    it("should not collide if out of range", function() {
      cam2.setPosition([0,2.1,0]);
      expect(bsp1.collide(bsp2, mat())).toBeFalsy();
    });
    
    it("should not collide if cubes intersect, but meshes do not", function() {
      // as spheres have radius 1, we'll move 1.1 units diagonally; because of the diagonal,
      // cubes will still intersect, but spheres will not.
      cam2.setPosition(vec3.scale(vec3.normalize([1,1,0]), 2.3));
      expect(bsp1.collide(bsp2, mat())).toBeFalsy();
    });
  });
  
  describe("with a single triangle", function() {
    beforeEach(function() {
      bsp.addTriangle(new Jax.Geometry.Triangle([0,1,0],  [-1,0,0],  [1,0,0]));
      bsp.finalize();
    });
    
    it("should be only 1 node deep", function() {
      expect(bsp.front).toBeKindOf(Jax.Geometry.Triangle);
      expect(bsp.back).toBeFalsy();
    });
    
    it("should have accurate halfSize", function() {
      expect(bsp.getHalfSize()).toEqualVector([1,0.5,0.01]);
    });
  });
  
  describe("with 2 triangles", function() {
    beforeEach(function() {
      bsp.addTriangle(new Jax.Geometry.Triangle([0,1,0],  [-1,0,0],  [1, 0,0]));
      bsp.addTriangle(new Jax.Geometry.Triangle([1,0,0],  [-1,0,0],  [0,-1,0]));
      bsp.finalize();
    });
    
    it("should have accurate halfSize", function() {
      expect(bsp.getHalfSize()).toEqualVector([1,1,0.01]);
    });
    
    it("should be only 1 node deep", function() {
      expect(bsp.front).toBeKindOf(Jax.Geometry.Triangle);
      expect(bsp.back).toBeKindOf(Jax.Geometry.Triangle);
    });
  });
  
  describe("with 3 triangles", function() {
    beforeEach(function() {
      bsp.addTriangle(new Jax.Geometry.Triangle([2,1,0],  [ 1,0,0],  [3,0,0]));
      bsp.addTriangle(new Jax.Geometry.Triangle([0,1,0],  [-1,0,0],  [1,0,0]));
      bsp.addTriangle(new Jax.Geometry.Triangle([1,0,0],  [-1,0,0],  [0,-1,0]));
      bsp.finalize();
    });
    
    it("should be 2 nodes deep", function() {
      expect(bsp.front).toBeKindOf(BSP);
      expect(bsp.back).toBeKindOf(Jax.Geometry.Triangle);
      expect(bsp.front.front).toBeKindOf(Jax.Geometry.Triangle);
      expect(bsp.front.back).toBeKindOf(Jax.Geometry.Triangle);
    });
  });

  describe("with 4 triangles", function() {
    beforeEach(function() {
      bsp.addTriangle(new Jax.Geometry.Triangle([2,1,0],  [ 1,0,0],  [3,0,0]));
      bsp.addTriangle(new Jax.Geometry.Triangle([0,1,0],  [-1,0,0],  [1,0,0]));
      bsp.addTriangle(new Jax.Geometry.Triangle([1,0,0],  [-1,0,0],  [0,-1,0]));
      bsp.addTriangle(new Jax.Geometry.Triangle([3,0,0],  [ 1,0,0],  [2,-1,0]));
      bsp.finalize();
    });
    
    it("should be 2 nodes deep", function() {
      expect(bsp.getTreeDepth()).toEqual(2);
      
      expect(bsp.front).toBeKindOf(BSP);
      expect(bsp.back).toBeKindOf(BSP);
      expect(bsp.front.front).toBeKindOf(Jax.Geometry.Triangle);
      expect(bsp.front.back).toBeKindOf(Jax.Geometry.Triangle);
      expect(bsp.back.front).toBeKindOf(Jax.Geometry.Triangle);
      expect(bsp.back.back).toBeKindOf(Jax.Geometry.Triangle);
    });
    
    it("should have depth values assigned", function() {
      expect(bsp.depth).toEqual(0);
      expect(bsp.front.depth).toEqual(1);
      expect(bsp.back.depth).toEqual(1);
      expect(bsp.front.front.depth).toEqual(2);
      expect(bsp.front.back.depth).toEqual(2);
      expect(bsp.back.front.depth).toEqual(2);
      expect(bsp.back.back.depth).toEqual(2);
    });
  });
  
  describe("with a cube", function() {
    beforeEach(function() {
      bsp.addMesh(new Jax.Mesh.Cube());
      bsp.finalize();
    });
    
    it("should be 4 nodes deep", function() {
      // sqrt(12 triangles) = 3.5 ~= 4
      expect(bsp.getTreeDepth()).toEqual(4);
    });
  });
});
