/**
 * class Grass < Jax.Model
 * 
 **/
Jax.getGlobal()['Grass'] = (function() {
  return Jax.Model.create({
    after_initialize: function() {
      var meadow = this.meadow;
      
      // make sure density/s has no fractional component or you'll get a checkerboard pattern
      var s = 0.02;//0.25;
      var density = 0.2;
      
      var t = this.height / 2.0;
      var grass = this;

      if (meadow) {
        this.mesh = new Jax.Mesh({
          material: Material.find("grass"),
        
          // allocate: function() {
          //   var quads = meadow.getWidth() * meadow.getDepth();
          //   quads *= Math.pow(1 / (s / density), 2);
          //   quads *= 3;
          // 
          //   return quads * 6;
          // },
          
          init: function(vertices, colors, texCoords, normals) {
            var mesh = this;
            this.grass_positions = [];
            
            // function addQuad(ROTATION, X, Y, Z) {
            //   var _X = Math.sin(ROTATION)*s, _Z = Math.cos(ROTATION)*s;
            //   var U;
            // 
            //   for (var I = 0; I < 4; I++) {
            //     U = I / 4.0;
            //     vertices.push(X-_X,Y+U*t    ,Z-_Z,  X+_X,Y+U*t,Z+_Z,  X-_X,Y+U*t+t/4,Z-_Z);
            //     vertices.push(X-_X,Y+U*t+t/4,Z-_Z,  X+_X,Y+U*t,Z+_Z,  X+_X,Y+U*t+t/4,Z+_Z);
            // 
            //     mesh.grass_positions.push(X,0,Z,  X,0,Z,  X,0,Z,    X,0,Z,  X,0,Z,  X,0,Z);
            //     normals.push(0,1,0, 0,1,0, 0,1,0); normals.push(0,1,0,  0,1,0, 0,1,0);
            // 
            //     texCoords.push(0,U,       1,U,  0,U+0.25);
            //     texCoords.push(0,U+0.25,  1,U,  1,U+0.25);
            //   }
            // }
          
            var y;
            for (var x = 0; x < meadow.getWidth(); x++) {
              for (var z = 0; z < meadow.getDepth(); z++) {
                y = 0;
                
                for (var i = 0; i < 1.0; i += s* 1.0/density) {
                  for (var j = 0; j < 1.0; j += s * 1.0/density) {
                    var ofsx = Math.random() * (density*2) - density;
                    var ofsz = Math.random() * (density*2) - density;
                    
                    var rot = Math.PI / 3;
                    for (k = 0; k <= 4; k += 2) {
                      var ROTATION = k * rot;
                      var X = x+i+ofsx, Y = y, Z = z+j+ofsz;
                      
                      var _X = Math.sin(ROTATION)*s, _Z = Math.cos(ROTATION)*s;
                      var U;

                      for (var I = 0; I < 4; I++) {
                        U = I / 4.0;
                        vertices.push(X-_X,Y+U*t    ,Z-_Z,  X+_X,Y+U*t,Z+_Z,  X-_X,Y+U*t+t/4,Z-_Z);
                        vertices.push(X-_X,Y+U*t+t/4,Z-_Z,  X+_X,Y+U*t,Z+_Z,  X+_X,Y+U*t+t/4,Z+_Z);

                        mesh.grass_positions.push(X,0,Z,  X,0,Z,  X,0,Z,    X,0,Z,  X,0,Z,  X,0,Z);
                        normals.push(0,1,0, 0,1,0, 0,1,0); normals.push(0,1,0,  0,1,0, 0,1,0);

                        texCoords.push(0,U,       1,U,  0,U+0.25);
                        texCoords.push(0,U+0.25,  1,U,  1,U+0.25);
                      }
                    }
                    // addQuad(0,               x+i+ofsx, y, z+j+ofsz);
                    // addQuad(2*Math.PI/3,     x+i+ofsx, y, z+j+ofsz);
                    // addQuad(4*Math.PI/3,     x+i+ofsx, y, z+j+ofsz);
                  }
                }
              }
            }
            
            mesh.grass_positions = new Jax.VertexBuffer(mesh.grass_positions);
          }
        });
      }
    }
  });
})();
