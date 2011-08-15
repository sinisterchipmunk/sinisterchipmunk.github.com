var BSP = (function() {
  // +level+ is an array, containing either Triangles or BSP nodes.
  // This function replaces every 2 elements in the array with a single
  // parent BSP node. The array is modified in-place and the size of the
  // array should be cut in half, to a minimum of 1.
  function buildLevel(level) {
    var nextLevel = [];
    var plane = new Jax.Geometry.Plane();
    while (level.length > 0) {
      var front = level.shift(), back = null;
      var dist = vec3.create();
      var closest = null, closest_index;
      
      var result = front;
      if (level.length > 0) {
        for (var j = 0; j < level.length; j++) {
          var len = vec3.length(vec3.subtract(front.center, level[j].center, dist));
          if (closest == null || closest > len) {
            closest = len;
            closest_index = j;
          }
        }
        back = level[closest_index];
        level.splice(closest_index, 1);

        // See if back and front are accurate. If not, swap them.

        // If triangle, use the plane created by the current triangle.
        // If node, use the first triangle in the box for a plane.
        if (front instanceof Jax.Geometry.Triangle)
          plane.set(front.a, front.b, front.c);
        else {
          var tri = front.front;
          while (tri instanceof BSP) tri = tri.front;
          plane.set(tri.a, tri.b, tri.c);
        }
        
        if (plane.whereis(back.center) == Jax.Geometry.Plane.FRONT)
          result = new BSP(back, front);
        else result = new BSP(front, back);
      }
      
      nextLevel.push(result);
    }
    
    for (var i = 0; i < nextLevel.length; i++)
      level.push(nextLevel[i]);
  }
  
  // Calculates the dimensions of a bounding box around
  // the given Triangle. If the triangle is axis-aligned,
  // one of the dimensions will be 0; in this case, 
  // that dimension of the bounding box will be set to a
  // very small positive value, instead.
  function calcTriangleExtents(tri) {
    var min = vec3.create(), max = vec3.create();

    vec3.min(vec3.min(tri.a, tri.b, min), tri.c, min);
    vec3.max(vec3.max(tri.a, tri.b, max), tri.c, max);
    min_size = 0.01;
    for (var i = 0; i < 3; i++) {
      if (max[i] - min[i] < min_size * 2) {
        max[i] += min_size;
        min[i] -= min_size;
      }
    }

    return [min, max];
  }
  
  return Jax.Class.create({
    initialize: function(front, back) {
      this.front = null;
      this.back = null;
      this.triangles = [];
      if (front || back) this.set(front, back);
    },
    
    /**
     * BSP#getRenderable() -> Jax.Model
     * 
     * Returns a model with a mesh assigned to it which, when rendered, allows
     * you to visualize this BSP tree starting with the current node.
     *
     * If called more than once, multiple separate models will be returned.
     **/
    getRenderable: function(startDepth) {
      startDepth = startDepth || 0;
      
      var self = this;
      function p(n, v, c) {
        if (n.front instanceof BSP) p(n.front, v, c);
        if (n.back  instanceof BSP) p(n.back,  v, c);
        if (n.depth < startDepth) return;
        
        var _c = n.depth == 0 ? 1 : 1 / n.depth;
        for (var i = 0; i < 24; i++) c.push(_c,_c,_c,1);
        
        var hs = n.getHalfSize();

        v.push(n.center[0]-hs[0], n.center[1]-hs[1], n.center[2]-hs[2]);
        v.push(n.center[0]+hs[0], n.center[1]-hs[1], n.center[2]-hs[2]);
              
        v.push(n.center[0]-hs[0], n.center[1]+hs[1], n.center[2]-hs[2]);
        v.push(n.center[0]+hs[0], n.center[1]+hs[1], n.center[2]-hs[2]);
              
        v.push(n.center[0]-hs[0], n.center[1]-hs[1], n.center[2]-hs[2]);
        v.push(n.center[0]-hs[0], n.center[1]+hs[1], n.center[2]-hs[2]);
              
        v.push(n.center[0]+hs[0], n.center[1]-hs[1], n.center[2]-hs[2]);
        v.push(n.center[0]+hs[0], n.center[1]+hs[1], n.center[2]-hs[2]);
              
        v.push(n.center[0]-hs[0], n.center[1]-hs[1], n.center[2]+hs[2]);
        v.push(n.center[0]+hs[0], n.center[1]-hs[1], n.center[2]+hs[2]);
              
        v.push(n.center[0]-hs[0], n.center[1]+hs[1], n.center[2]+hs[2]);
        v.push(n.center[0]+hs[0], n.center[1]+hs[1], n.center[2]+hs[2]);
              
        v.push(n.center[0]-hs[0], n.center[1]-hs[1], n.center[2]+hs[2]);
        v.push(n.center[0]-hs[0], n.center[1]+hs[1], n.center[2]+hs[2]);
              
        v.push(n.center[0]+hs[0], n.center[1]-hs[1], n.center[2]+hs[2]);
        v.push(n.center[0]+hs[0], n.center[1]+hs[1], n.center[2]+hs[2]);
              
        v.push(n.center[0]-hs[0], n.center[1]-hs[1], n.center[2]-hs[2]);
        v.push(n.center[0]-hs[0], n.center[1]-hs[1], n.center[2]+hs[2]);
              
        v.push(n.center[0]-hs[0], n.center[1]+hs[1], n.center[2]-hs[2]);
        v.push(n.center[0]-hs[0], n.center[1]+hs[1], n.center[2]+hs[2]);
              
        v.push(n.center[0]+hs[0], n.center[1]-hs[1], n.center[2]-hs[2]);
        v.push(n.center[0]+hs[0], n.center[1]-hs[1], n.center[2]+hs[2]);
              
        v.push(n.center[0]+hs[0], n.center[1]+hs[1], n.center[2]-hs[2]);
        v.push(n.center[0]+hs[0], n.center[1]+hs[1], n.center[2]+hs[2]);
      }
      return new Jax.Model({mesh: this.mesh = this.mesh || new Jax.Mesh({
        init: function(v, c) {
          this.draw_mode = GL_LINES;
          p(self, v, c);
        }
      })});
    },
    
    /**
     * BSP#getClosestNode(point) -> BSP | Jax.Geometry.Triangle
     * - point (vec3): the point to be tested
     * 
     * Returns the node closest to the given point. If only one
     * sub-node exists, that node is returned. If no sub-nodes
     * exist, this node is returned.
     **/
    getClosestNode: function(point) {
      if (!this.front || !this.back) return this.front || this.back || this;
      var vec = vec3.create();
      var dist = vec3.length(vec3.subtract(this.front.center, point, vec));
      if (dist < vec3.length(vec3.subtract(this.back.center, point, vec)))
        return this.front;
      return this.back;
    },
    
    set: function(nodeFront, nodeBack) {
      this.front = nodeFront;
      this.back = nodeBack;
      this.calcBounds();
      this.box = new Box(this.center, this.halfSize);
    },
    
    /**
     * BSP#collide(other, transform) -> Boolean | Object
     * - other (BSP): the potentially-colliding BSP model
     * - transform (mat4): a transformation matrix which is used to convert
     *                     +other+ into this BSP's coordinate space.
     *
     * Applies the given transformation matrix to +other+; if any triangle
     * within +other+ is intersecting any triangle in this BSP tree, then
     * a generic object containing the properties +first+, +second+ and
     * +second_transformed+ is returned. They have the following meanings:
     *
     * * +first+ : the colliding triangle in this BSP tree
     * * +second+: the colliding triangle in the +other+ BSP tree
     * * +second_transformed+: a copy of the colliding triangle in the +other+
     *                         BSP tree, transformed by the matrix to be
     *                         in this BSP tree’s coordinate space.
     *
     * If no collision has occurred, +false+ is returned.
     *
     **/
    collide: function(other, transform) {
      if (!this.finalized) this.finalize();
      if (!other.finalized) other.finalize();
      
      // buffer checks for GC optimization
      var checks = this.checks = this.checks || [{}];
      var check_id = 1;
      checks[0][0] = this;
      checks[0][1] = other;
      var tri = new Jax.Geometry.Triangle(), a = vec3.create(), b = vec3.create(), c = vec3.create();
      
      while (check_id > 0) {
        var check = checks[--check_id];
        var first = check[0], second = check[1];
        if (first instanceof BSP && second instanceof BSP) {
          // both elements are nodes, if they intersect move to the next level;
          // if they don't intersect, let them disappear.
          if (first.box.intersectOBB(second.box, transform)) {
            while (checks.length - check_id < 4) checks.push([{}]);
            checks[check_id  ][0] = first.front;  checks[check_id  ][1] = second.front;
            checks[check_id+1][0] = first.back;   checks[check_id+1][1] = second.front;
            checks[check_id+2][0] = first.front;  checks[check_id+2][1] = second.back;
            checks[check_id+3][0] = first.back;   checks[check_id+3][1] = second.back;
            check_id += 4;
          }
        } else if (first instanceof Jax.Geometry.Triangle && second instanceof BSP) {
          // front is a tri, keep it to retest against back's children
          while (checks.length - check_id < 2) checks.push([{}]);
          checks[check_id  ][0] = first; checks[check_id  ][1] = second.front;
          checks[check_id+1][0] = first; checks[check_id+1][1] = second.back;
          check_id += 2;
        } else if (first instanceof BSP && second instanceof Jax.Geometry.Triangle) {
          // back is a tri, keep it to retest against front's children
          while (checks.length - check_id < 2) checks.push([{}]);
          checks[check_id  ][0] = first.front;  checks[check_id  ][1] = second;
          checks[check_id+1][0] = first.back;   checks[check_id+1][1] = second;
          check_id += 2;
        } else {
          // dealing with 2 triangles, perform intersection test
          // transform second into first's coordinate space
          mat4.multiplyVec3(transform, second.a, a);
          mat4.multiplyVec3(transform, second.b, b);
          mat4.multiplyVec3(transform, second.c, c);
          tri.set(a, b, c);
          
          if (first.intersectTriangle(tri)) {
            this.collision = {
              first: first,
              second: second,
              second_transformed: new Jax.Geometry.Triangle(tri.a, tri.b, tri.c)
            };
            return this.collision;
          }
        }
      }
      return false;
    },
    
    collideSphere: function(position, radius) {
      if (!this.finalized) this.finalize();
      
      // buffer checks for GC optimization
      var checks = this.checks = this.checks || [];
      var check_id = 1;
      checks[0] = this;
      
      while (check_id > 0) {
        var node = checks[--check_id];
        if (node instanceof BSP) {
          // element is a BSP node, if it intersects move to the next level;
          // if it doesn't, let it disappear
          if (node.box.intersectSphere(position, radius)) {
            var d1 = this._dist1 = this._dist1 || vec3.create();
            
            var len1 = vec3.length(vec3.subtract(node.front.center, position, d1));
            var len2 = vec3.length(vec3.subtract(node.back.center, position, d1));
            
            if (len1 < len2) {
              // front is closer, check it FIRST since it's more likely to collide
              checks[check_id  ] = node.front;
              checks[check_id+1] = node.back;
            } else {
              checks[check_id  ] = node.back;
              checks[check_id+1] = node.front;
            }
            
            check_id += 2;
          }
        } else {
          // dealing with a triangle, perform intersection test
          // transform second into first's coordinate space
          var collisionPoint = vec3.create();
          if (node.intersectSphere(position, radius, collisionPoint)) {
            var distance = vec3.length(vec3.subtract(collisionPoint, position, vec3.create()));
            this.collision = {
              triangle: node,
              collisionPoint: collisionPoint,
              penetration: radius - distance
            };
            return this.collision;
          }
        }
      }
      return false;
    },
    
    collideLineSegment: function(origin, direction, length) {
      if (!this.finalized) this.finalize();
      
      // buffer checks for GC optimization
      var checks = this.checks = this.checks || [];
      var check_id = 1;
      checks[0] = this;
      
      while (check_id > 0) {
        var node = checks[--check_id];
        if (node instanceof BSP) {
          // element is a BSP node, if it intersects move to the next level;
          // if it doesn't, let it disappear
          if (node.box.intersectLineSegment(origin, direction, length)) {
            var d1 = this._dist1 = this._dist1 || vec3.create();
            
            var len1 = vec3.length(vec3.subtract(node.front.center, position, d1));
            var len2 = vec3.length(vec3.subtract(node.back.center, position, d1));
            
            if (len1 < len2) {
              // front is closer, check it FIRST since it's more likely to collide
              checks[check_id  ] = node.front;
              checks[check_id+1] = node.back;
            } else {
              checks[check_id  ] = node.back;
              checks[check_id+1] = node.front;
            }

            check_id += 2;
          }
        } else {
          // dealing with a triangle, perform intersection test
          // transform second into first's coordinate space
          var collisionPoint = vec4.create();
          if (node.intersectRay(origin, direction, collisionPoint, length)) {
            this.collision = {
              triangle: node,
              collisionPoint: collisionPoint
            };
            return this.collision;
          }
        }
      }
      return false;
    },
    
    getCollision: function() { return this.collision; },
    
    getHalfSize: function() {
      return this.halfSize || this.calcBounds().halfSize;
    },
    
    calcBounds: function() {
      var min = vec3.create([ 0xffffffff,  0xffffffff,  0xffffffff]),
          max = vec3.create([-0xffffffff, -0xffffffff, -0xffffffff]);

      function calcSide(side) {
        var smin, smax;
        
        if (side instanceof Jax.Geometry.Triangle) {
          var v = calcTriangleExtents(side);
          smin = v[0];
          smax = v[1];
        } else {
          smin = vec3.subtract(side.center, side.getHalfSize(), vec3.create());
          smax = vec3.add(side.center, side.getHalfSize(), vec3.create());
        }
        
        vec3.min(min, smin, min);
        vec3.max(max, smax, max);
      }
      
      if (this.front) calcSide(this.front);
      if (this.back)  calcSide(this.back);
      
      this.size     = vec3.subtract(max, min, vec3.create());
      this.halfSize = vec3.scale(this.size, 0.5, vec3.create());
      this.center   = vec3.add(min, this.halfSize, vec3.create());

      return this;
    },
    
    getSize: function() {
      if (!this.halfSize) this.calcHalfSize();
      return this.size;
    },
    
    getCenter: function() {
      return this.center;
    },
    
    finalize: function() {
      var level = [];
      for (var i = 0; i < this.triangles.length; i++)
        level.push(this.triangles[i]);
      this.treeDepth = 1;
      while (level.length > 2) {
        buildLevel(level);
        this.treeDepth++;
      }
      this.set(level[0], level[1]);
      
      // set depths
      var depth = 0;
      var nodes = [this];
      this.depth = 0;
      while (nodes.length) {
        var x = nodes.shift();
        if (x.front) { x.front.depth = x.depth + 1; nodes.push(x.front); }
        if (x.back) { x.back.depth = x.depth + 1; nodes.push(x.back); }
      }
      
      this.finalized = true;
    },
    
    getDepth: function() { return this.depth; },
    
    getTreeDepth: function() { return this.treeDepth; },
    
    addTriangle: function(triangle) {
      this.triangles.push(triangle);
    },
    
    /**
     * BSP#traverse(point, callback) -> undefined
     * - point (vec3): the position of the camera, used for polygon sorting
     * - callback (Function): a callback function to call with each leaf
     *                              node as an argument
     * 
     * Traverses the BSP tree using the given point as a reference; leaf nodes
     * will be sent to the +callback+ function in back-to-front order.
     **/
    traverse: function(point, callback) {
      // handle the special case of having only 1 child
      if (!this.front || !this.back) {
        var result = this.front || this.back;
        if (result instanceof BSP) result.traverse(point, callback);
        else callback(result);
        return;
      }
      
      // find the distance from front to point, and from back to point
      var dist = vec3.create();
      vec3.subtract(this.front.center, point, dist);
      var frontLen = vec3.dot(dist, dist);
      vec3.subtract(this.back.center, point, dist);
      var backLen = vec3.dot(dist, dist);
      
      if (frontLen < backLen) {
        // closer to front, traverse back first
        if (this.back instanceof BSP) this.back.traverse(point, callback);
        else callback(this.back);
        
        if (this.front instanceof BSP) this.front.traverse(point, callback);
        else callback(this.front);
      } else {
        // closer to back, traverse front first
        if (this.front instanceof BSP) this.front.traverse(point, callback);
        else callback(this.front);

        if (this.back instanceof BSP) this.back.traverse(point, callback);
        else callback(this.back);
      }
    },
    
    addMesh: function(mesh) {
      var triangles = mesh.getTriangles();
      for (var i = 0; i < triangles.length; i++)
        this.addTriangle(triangles[i]);
    }
  });
})();