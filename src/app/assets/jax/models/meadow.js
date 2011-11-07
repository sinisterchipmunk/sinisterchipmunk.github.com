/**
 * class Meadow < Jax.Model
 * 
 **/
Jax.getGlobal()['Meadow'] = (function() {
  return Jax.Model.create({
    after_initialize: function() {
      this.lit = false;
      var meadow = this;
      if (this.height_map) {
        var width = this.height_map.width, depth = this.height_map.depth;
        this.mesh = new Jax.Mesh({
          worldSize: [width+1, depth+1],
          material: Material.find("heightmap"),
          init: function(vertices, colors, texCoords, normals) {
            for (var z = 0; z < depth; z++) {
              var w = width+1, d = depth+1;
              for (var x = 0; x < width; x++) {
                vertices.push(x, 0, z);
                vertices.push(x+1, 0, z);
                vertices.push(x, 0, z+1);
                
                vertices.push(x, 0, z+1);
                vertices.push(x+1, 0, z);
                vertices.push(x+1, 0, z+1);
                
                texCoords.push(x/w, z/d);
                texCoords.push((x+1)/w, z/d);
                texCoords.push(x/w, (z+1)/d);

                texCoords.push(x/w, (z+1)/d);
                texCoords.push((x+1)/w, z/d);
                texCoords.push((x+1)/w, ((z+1)/d));
                
                var c = 0.25;//0.25;
                colors.push(c,c,c,1, c,c,c,1, c,c,c,1, c,c,c,1, c,c,c,1, c,c,c,1);
              }
            }
            // calculate normals
            var v0 = vec3.create(), v1 = vec3.create(), v2 = vec3.create();
            function pushNormal(x, z) {
              v0[0] = x;   v0[1] = 0;   v0[2] = z;
              v1[0] = x+1; v1[1] = 0; v1[2] = z;
              v2[0] = x;   v2[1] = 0; v2[2] = z+1;
              vec3.subtract(v1, v0, v1);
              vec3.subtract(v2, v0, v2);
              vec3.normalize(vec3.cross(v2, v1, v1), v1);
              normals.push(v1[0], v1[1], v1[2]);
            }
            for (var z = 0; z < width; z++)
              for (var x = 0; x < depth; x++) {
                pushNormal(x, z);
                pushNormal(x+1, z);
                pushNormal(x, z+1);
                pushNormal(x, z+1);
                pushNormal(x+1, z);
                pushNormal(x+1, z+1);
              }
          }
        });
      }
    },
    
    getWidth: function() { return this.height_map.width; },
    
    getDepth: function() { return this.height_map.depth; },
    
    addGrass: function(world) {
      return world.addObject(new Grass({meadow:this}));
    }
  });
})();
