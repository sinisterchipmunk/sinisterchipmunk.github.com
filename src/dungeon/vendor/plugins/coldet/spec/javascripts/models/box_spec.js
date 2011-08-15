describe("Box", function() {
  var box;
  
  beforeEach(function() {
    box = new Box([2.5, 2.5, 2.5], [0.5,0.5,0.5]);
  });
  
  describe("intersection", function() {
    describe("obb", function() {
      var cam;
      beforeEach(function() { cam = new Jax.Camera(); cam.setPosition([2,2,2]); });
      
      it("identity overlap hit", function() {
        expect(box.intersectOBB(new Box([2.5,2.5,2.5], [0.5,0.5,0.5]), mat4.IDENTITY)).toBeTruthy();
      });
      
      it("camera overlap hit", function() {
        expect(box.intersectOBB(new Box([0.5,0.5,0.5], [0.5,0.5,0.5]), cam.getTransformationMatrix())).toBeTruthy();
      });
      
      it("0.1 unit distance hit", function() {
        var box1 = new Box([0.5,0.5,0.5], [0.5,0.5,0.5]);
        var box2 = new Box([0.5,0.6,0.5], [0.5,0.5,0.5]);
        
        expect(box1.intersectOBB(box2, mat4.IDENTITY)).toBeTruthy();
      });
      
      it("0.1 unit translate hit", function() {
        var box1 = new Box([0.5,0.5,0.5], [0.5,0.5,0.5]);
        var box2 = new Box([0.5,0.5,0.5], [0.5,0.5,0.5]);
        var mat = mat4.identity(mat4.create());
        mat4.translate(mat, [0,0.1,0], mat);
        
        expect(box1.intersectOBB(box2, mat)).toBeTruthy();
      });
      
      it("0.75 unit translate hit", function() {
        var box1 = new Box([0.5,0.5,0.5], [1,1,1]);
        var box2 = new Box([0.5,0.5,0.5], [1,1,1]);
        var mat = mat4.identity(mat4.create());
        mat4.translate(mat, [0,0.75,0], mat);
        
        expect(box1.intersectOBB(box2, mat)).toBeTruthy();
      });
      
      it("0.5rad Y-axis rotation hit", function() {
        var box1 = new Box([0,0,0], [0.5,0.5,0.5]);
        var box2 = new Box([1.01,0,0], [0.5,0.5,0.5]);
        
        var cam = new Jax.Camera();
        cam.rotate(0.5, [0,1,0]);
        
        expect(box1.intersectOBB(box2, cam.getTransformationMatrix())).toBeTruthy();
      });
      
      it("rotated overlap hit", function() {
        cam.rotate(Math.PI/6, [0,1,0]);
        expect(box.intersectOBB(new Box([0.5,0.5,0.5], [0.5,0.5,0.5]), cam.getTransformationMatrix())).toBeTruthy();
      });
      
      it("offset hit", function() {
        cam.setPosition(1.5,1.5,1.5);
        expect(box.intersectOBB(new Box([0.5,0.5,0.5], [0.5,0.5,0.5]), cam.getTransformationMatrix())).toBeTruthy();
      });
      
      it("rotated offset hit", function() {
        cam.setPosition(1.5,1.5,1.5);
        cam.rotate(Math.PI/8, [0,1,0]);
        expect(box.intersectOBB(new Box([0.5,0.5,0.5], [0.5,0.5,0.5]), cam.getTransformationMatrix())).toBeTruthy();
      });
      
      it("offset miss", function() {
        cam.setPosition(-1,2,2);
        expect(box.intersectOBB(new Box([0.5,0.5,0.5], [0.5,0.5,0.5]), cam.getTransformationMatrix())).toBeFalsy();
      });

      it("rotated offset miss", function() {
        cam.setPosition(-1,2,2);
        cam.rotate(Math.PI, [0,1,0]);
        expect(box.intersectOBB(new Box([0.5,0.5,0.5], [0.5,0.5,0.5]), cam.getTransformationMatrix())).toBeFalsy();
      });
    });
    
    describe("aabb", function() {
      it("hit", function() {
        expect(box.intersectAABB(new Box([1.5,1.5,1.5], [0.6,0.6,0.6]))).toBeTruthy();
      });
      
      it("overlap", function() {
        expect(box.intersectAABB(new Box([2.5,2.5,2.5], [0.5,0.5,0.5]))).toBeTruthy();
      });
      
      it("miss", function() {
        expect(box.intersectAABB(new Box([0.5,0.5,0.5], [0.5,0.5,0.5]))).toBeFalsy();
      });
    });
    
    describe("point", function() {
      it("hit", function() {
        expect(box.intersectPoint([2.5, 2.5, 2.5])).toBeTruthy();
      });
      
      it("hit edge", function() {
        expect(box.intersectPoint([2,2,2])).toBeTruthy();
      });
      
      it("miss", function() {
        expect(box.intersectPoint([1,1,1])).toBeFalsy();
      });
    });
    
    describe("sphere", function() {
      it("hit edge", function() {
        expect(box.intersectSphere([1,2,2], 1)).toBeTruthy();
      });
      
      it("hit center", function() {
        expect(box.intersectSphere([2,2,2], 1)).toBeTruthy();
      });
      
      it("miss", function() {
        expect(box.intersectSphere([0,2,2], 0.5)).toBeFalsy();
      });
    });
    
    describe("line segment", function() {
      it("hit", function() {
        expect(box.intersectLineSegment([1.5,1.5,0], [4,2.5,2.5])).toBeTruthy();
        expect(box.intersectLineSegment([1.5,1.5,1.5], [2.5,2.5,2.5])).toBeTruthy();
        expect(box.intersectLineSegment([2.5,2.5,2.5], [2.6,2.6,2.6])).toBeTruthy();
        expect(box.intersectLineSegment([1.5,2.5,2.5], [1,0,0], 1)).toBeTruthy();
      });
      
      it("miss via ray", function() {
        expect(box.intersectRay([-1,0,0], [1,0,0], 0.5)).toBeFalsy();
      });
      
      it("miss", function() {
        expect(box.intersectLineSegment([0,0,0], [1,1,1])).toBeFalsy();
        expect(box.intersectLineSegment([0,0,0], [4,1,1])).toBeFalsy();
        expect(box.intersectLineSegment([1.5,1.5,0], [4,2.5,1])).toBeFalsy();

        expect(box.intersectLineSegment([0,0,0], vec3.normalize([1,1,1]), vec3.length([1,1,1]))).toBeFalsy();
        expect(box.intersectLineSegment([0,0,0], vec3.normalize([4,1,1]), vec3.length([4,1,1]))).toBeFalsy();
        expect(box.intersectLineSegment([1.5,1.5,0], vec3.normalize([2.5,1,1]), vec3.length([2.5,1,1]))).toBeFalsy();
        expect(box.intersectLineSegment([-1,0,0], [1,0,0], 0.5)).toBeFalsy();
      });
    });
    
    describe("ray", function() {
      it("hit", function() {
        expect(box.intersectRay([-1,-1,-1], vec3.normalize([1,1,1]))).toBeTruthy();
      });
      
      it("miss", function() {
        expect(box.intersectRay([-1,0,0], [-1,0,0])).toBeFalsy();
      });
    });
  });
});
