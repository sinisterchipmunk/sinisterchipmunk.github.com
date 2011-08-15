describe("vec3", function() {
  describe("#min", function() {
    var min, ret;
    var a, b;
    
    beforeEach(function() {
      a = [0,3,5];
      b = [1,2,7];
    });
    
    describe("with dest", function() {
      beforeEach(function() {
        min = vec3.create();
        ret = vec3.min(a, b, min);
      });
      
      it("should return min", function() {
        expect(ret).toBe(min);
      });
      
      it("should equal [0,2,5]", function() {
        expect(min).toEqualVector([0,2,5]);
      });

      it("should not alter a or b", function() {
        expect(a).toEqualVector([0,3,5]);
        expect(b).toEqualVector([1,2,7]);
      });
    });
    
    describe("omitting dest", function() {
      beforeEach(function() {
        min = vec3.min(a, b);
      });
      
      it("should equal [0,2,5]", function() {
        expect(min).toEqualVector([0,2,5]);
      });
      
      it("should not alter a or b", function() {
        expect(a).toEqualVector([0,3,5]);
        expect(b).toEqualVector([1,2,7]);
      });
    });
  });

  describe("#max", function() {
    var max, ret;
    var a, b;
    
    beforeEach(function() {
      a = [0,3,5];
      b = [1,2,7];
    });
    
    describe("with dest", function() {
      beforeEach(function() {
        max = vec3.create();
        ret = vec3.max(a, b, max);
      });
      
      it("should return max", function() {
        expect(ret).toBe(max);
      });
      
      it("should equal [1,3,7]", function() {
        expect(max).toEqualVector([1,3,7]);
      });

      it("should not alter a or b", function() {
        expect(a).toEqualVector([0,3,5]);
        expect(b).toEqualVector([1,2,7]);
      });
    });
    
    describe("omitting dest", function() {
      beforeEach(function() {
        max = vec3.max(a, b);
      });
      
      it("should equal [1,3,7]", function() {
        expect(max).toEqualVector([1,3,7]);
      });
      
      it("should not alter a or b", function() {
        expect(a).toEqualVector([0,3,5]);
        expect(b).toEqualVector([1,2,7]);
      });
    });
  });
});
