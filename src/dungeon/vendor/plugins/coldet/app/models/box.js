var Box = (function() {
  var bufs = {};
  
  return Jax.Class.create({
    /**
     * new Box()
     * new Box(x, y, z, w, h, d)
     * new Box(pos, size)
     * new Box(box)
     * - x (Number): X position coordinate
     * - y (Number): Y position coordinate
     * - z (Number): Z position coordinate
     * - w (Number): box width
     * - h (Number): box height
     * - d (Number): box depth
     * - pos (vec3): position vector
     * - size (vec3): dimensions vector
     * - box (Box): box to clone
     *
     **/
    initialize: function() {
      /*
      this.position = vec3.create();
      */
      this.halfSize = vec3.create();
      this.center = vec3.create();
    
      switch(arguments.length) {
        case 0: break;
        case 6:
          this.center[0] = arguments[0];
          this.center[1] = arguments[1];
          this.center[2] = arguments[2];
          this.halfSize[0] = arguments[3];
          this.halfSize[1] = arguments[4];
          this.halfSize[2] = arguments[5];
          break;
        case 2:
          vec3.set(arguments[0], this.center);
          vec3.set(arguments[1], this.halfSize);
          break;
        case 1:
          vec3.set(arguments[0].getCenter(), this.center);
          vec3.set(arguments[0].getHalfSize(), this.halfSize);
          break;
        default: throw new Error("invalid arguments");
      }
    },
    
    toString: function() {
      return "[Box center:"+this.center+"; half-size:"+this.halfSize+"]";
    },
  
    getHalfSize: function() { return this.halfSize; },
    getCenter: function() { return this.center; },
    getVolume: function() { return this.halfSize[0] * this.halfSize[1] * this.halfSize[2] * 8; },
  
    intersectRay: function(O, D, segmax) {
      if (segmax != undefined) return this.intersectLineSegment(O, D, segmax);

      var abs_segdir = vec3.create();
      var abs_cross = vec3.create();
      var f;
      var diff = vec3.create();
      var size = vec3.scale(this.halfSize, 2, vec3.create());
      var cross = vec3.create();
    
      vec3.subtract(O, this.center, diff);

      for(i=0;i<3;i++)
      {
        abs_segdir[i] = Math.abs(D[i]);
        if (Math.abs(diff[i]) > size[i] && diff[i]*D[i] >= 0)
          return false;
      }

      vec3.cross(D, diff, cross);

      abs_cross[0] = Math.abs(cross[0]);
      f = size[1]*abs_segdir[2] + size[2]*abs_segdir[1];
      if (abs_cross[0] > f)
          return false;

      abs_cross[1] = Math.abs(cross[1]);
      f = size[0]*abs_segdir[2] + size[2]*abs_segdir[0];
      if (abs_cross[1] > f)
          return false;

      abs_cross[2] = Math.abs(cross[2]);
      f = size[0]*abs_segdir[1] + size[1]*abs_segdir[0];
      if (abs_cross[2] > f)
          return false;

      return true;
    },
  
    /**
     * Box#intersectLineSegment(O, D, segmax) -> Boolean
     * Box#intersectLineSegment(O, P) -> Boolean
     **/
    intersectLineSegment: function(O, D, segmax) {
      var tmp = vec3.create();
      
      if (segmax != undefined) {
        if (!isFinite(segmax)) return intersect(O,D); // infinite ray
        vec3.scale(D, segmax, tmp);
      } else {
        vec3.subtract(D, O, tmp);
        vec3.create();
        D = vec3.normalize(D, vec3.create());
      }
      
      var a0, a1, b0, b1;
      for (var i = 0; i < 3; i++) {
        a0 = this.center[i] - this.halfSize[i];
        a1 = this.center[i] + this.halfSize[i];
        b0 = O[i];
        b1 = O[i] + tmp[i];
        var c;
        
        if (b0 < a0) { if (a0 >= b1) return false; }
        else           if (b0 >= a1) return false;
      }
      return true;
    },
  
    intersectSphere: function(O, radius) {
      var mx = vec3.create();
      vec3.add(this.center, this.halfSize, mx);

      var dist = 0, d, ci;
      for(var i=0;i<3;i++)
      {
        ci = this.center[i] - this.halfSize[i];
        if (O[i] < ci)
        {
          d = O[i] - ci;
          dist += d*d;
        }
        else
        if (O[i] > mx[i])
        {
          d = O[i] - mx[i];
          dist += d*d;
        }
      }
      return (dist <= (radius*radius));
    },
  
    intersectPoint: function(p) {
      var pos = this.center;
      var s = this.halfSize;
      if (p[0] < pos[0] - s[0] || p[0] > pos[0] + s[0]) return false;
      if (p[1] < pos[1] - s[1] || p[1] > pos[1] + s[1]) return false;
      if (p[2] < pos[2] - s[2] || p[2] > pos[2] + s[2]) return false;
      return true;
    },
  
    intersectAABB: function(b) {
      var t1 = this.center;
      var t2 = vec3.create();
      var p1 = b.getCenter();
      var p2 = vec3.create();
      var bhs = b.getHalfSize();
      vec3.add(t1, this.halfSize, t2);
      vec3.add(p1, bhs, p2);
    
      return (Math.max(p1[0] - bhs[0], t1[0] - this.halfSize[0]) <= Math.min(p2[0], t2[0]) && 
              Math.max(p1[1] - bhs[1], t1[1] - this.halfSize[1]) <= Math.min(p2[1], t2[1]) && 
              Math.max(p1[2] - bhs[2], t1[2] - this.halfSize[2]) <= Math.min(p2[2], t2[2]));
    },
    
    intersectOBB: function(b, matrix) {
      
      var Pa = bufs.Pa = bufs.Pa || vec3.create(),
          Ax = vec3.UNIT_X, Ay = vec3.UNIT_Y, Az = vec3.UNIT_Z,
          Wa = this.halfSize[0], Ha = this.halfSize[1], Da = this.halfSize[2];
      
      var Pb = bufs.Pb = bufs.Pb || vec3.create(),
          Bx = bufs.Bx = bufs.Bx || vec3.create(),
          By = bufs.By = bufs.By || vec3.create(),
          Bz = bufs.Bz = bufs.Bz || vec3.create(),
          Wb = b.halfSize[0], Hb = b.halfSize[1], Db = b.halfSize[2];
          
      vec3.set(this.center, Pa);
      vec3.set(b.center, Pb);
      vec3.set(vec3.UNIT_X, Bx);
      vec3.set(vec3.UNIT_Y, By);
      vec3.set(vec3.UNIT_Z, Bz);
      
      mat4.multiplyVec3(matrix, Pb, Pb);
      
      var nm = bufs.nm = bufs.nm || mat3.create();
      mat4.toInverseMat3(matrix, nm);
      mat3.transpose(nm);
      mat3.multiplyVec3(nm, Bx, Bx);
      mat3.multiplyVec3(nm, By, By);
      mat3.multiplyVec3(nm, Bz, Bz);
      
      var T = bufs.T = bufs.T || vec3.create();
      vec3.subtract(Pb, Pa, T);
      
      // case 1: L = Ax
      var Rxx = vec3.dot(Ax, Bx), Rxy = vec3.dot(Ax, By), Rxz = vec3.dot(Ax, Bz);
      if (Math.abs(vec3.dot(T, Ax)) > Wa + Math.abs(Wb * Rxx) + Math.abs(Hb * Rxy) + Math.abs(Db * Rxz))
        return false;
        
      // case 2: L = Ay
      var Ryx = vec3.dot(Ay, Bx), Ryy = vec3.dot(Ay, By), Ryz = vec3.dot(Ay, Bz);
      if (Math.abs(vec3.dot(T, Ay)) > Ha + Math.abs(Wb * Ryx) + Math.abs(Hb * Ryy) + Math.abs(Db * Ryz))
        return false;
      
      // case 3: L = Az
      var Rzx = vec3.dot(Az, Bx), Rzy = vec3.dot(Az, By), Rzz = vec3.dot(Az, Bz);
      if (Math.abs(vec3.dot(T, Az)) > Da + Math.abs(Wb * Rzx) + Math.abs(Hb * Rzy) + Math.abs(Db * Rzz))
        return false;

      // case 4: L = Bx
      if (Math.abs(vec3.dot(T, Bx)) > Wb + Math.abs(Wa * Rxx) + Math.abs(Ha * Ryx) + Math.abs(Da * Rzx))
        return false;

      // case 5: L = By
      if (Math.abs(vec3.dot(T, By)) > Hb + Math.abs(Wa * Rxy) + Math.abs(Ha * Ryy) + Math.abs(Da * Rzy))
        return false;
      
      // case 6: L = Bz
      if (Math.abs(vec3.dot(T, Bz)) > Db + Math.abs(Wa * Rxz) + Math.abs(Ha * Ryz) + Math.abs(Da * Rzz))
        return false;

      // case 7: L = Ax x Bx
      if (Math.abs(vec3.dot(T, Az) * Ryx - vec3.dot(T, Ay) * Rzx) > Math.abs(Ha * Rzx) + Math.abs(Da * Ryx) + Math.abs(Hb * Rxz) + Math.abs(Db * Rxy))
        return false;

      // case 8: L = Ax x By
      if (Math.abs(vec3.dot(T, Az) * Ryy - vec3.dot(T, Ay) * Rzy) > Math.abs(Ha * Rzy) + Math.abs(Da * Ryy) + Math.abs(Wb * Rxz) + Math.abs(Db * Rxx))
        return false;
      
      // case 9: L = Ax x Bz
      if (Math.abs(vec3.dot(T, Az) * Ryz - vec3.dot(T, Ay) * Rzz) > Math.abs(Ha * Rzz) + Math.abs(Da * Ryz) + Math.abs(Wb * Rxy) + Math.abs(Hb * Rxx))
        return false;

      // case 10: L = Ay x Bx
      if (Math.abs(vec3.dot(T, Ax) * Rzx - vec3.dot(T, Az) * Rxx) > Math.abs(Wa * Rzx) + Math.abs(Da * Rxx) + Math.abs(Hb * Ryz) + Math.abs(Db * Ryy))
        return false;

      // case 11: L = Ay x By
      if (Math.abs(vec3.dot(T, Ax) * Rzy - vec3.dot(T, Az) * Rxy) > Math.abs(Wa * Rzy) + Math.abs(Da * Rxy) + Math.abs(Wb * Ryz) + Math.abs(Db * Ryx))
        return false;

      // case 12: L = Ay x Bz
      if (Math.abs(vec3.dot(T, Ax) * Rzz - vec3.dot(T, Az) * Rxz) > Math.abs(Wa * Rzz) + Math.abs(Da * Rxz) + Math.abs(Wb * Ryy) + Math.abs(Hb * Ryx))
        return false;

      // case 13: L = Az x Bx
      if (Math.abs(vec3.dot(T, Ay) * Rxx - vec3.dot(T, Ax) * Ryx) > Math.abs(Wa * Ryx) + Math.abs(Ha * Rxx) + Math.abs(Hb * Rzz) + Math.abs(Db * Rzy))
        return false;

      // case 14: L = Az x By
      if (Math.abs(vec3.dot(T, Ay) * Rxy - vec3.dot(T, Ax) * Ryy) > Math.abs(Wa * Ryy) + Math.abs(Ha * Rxy) + Math.abs(Wb * Rzz) + Math.abs(Db * Rzx))
        return false;

      // case 15: L = Az x Bz
      if (Math.abs(vec3.dot(T, Ay) * Rxz - vec3.dot(T, Ax) * Ryz) > Math.abs(Wa * Ryz) + Math.abs(Ha * Rxz) + Math.abs(Wb * Rzy) + Math.abs(Hb * Rzx))
        return false;

      return true;
    }
  });
})();
