/**
 * class Grass < Jax.Model
 * 
 **/
var Grass = (function() {
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
        
          init: function(vertices, colors, texCoords, normals) {
            var mesh = this;
            this.grass_positions = [];
            
            function addQuad(rotation, x, y, z) {
              var _x = Math.sin(rotation)*s, _z = Math.cos(rotation)*s;
              var u;
            
              for (var i = 0; i < 4; i++) {
                u = i / 4.0;
                vertices.push(x-_x,y+u*t    ,z-_z,  x+_x,y+u*t,z+_z,  x-_x,y+u*t+t/4,z-_z);
                vertices.push(x-_x,y+u*t+t/4,z-_z,  x+_x,y+u*t,z+_z,  x+_x,y+u*t+t/4,z+_z);

                mesh.grass_positions.push(x,0,z,  x,0,z,  x,0,z,    x,0,z,  x,0,z,  x,0,z);
                normals.push(0,1,0, 0,1,0, 0,1,0); normals.push(0,1,0,  0,1,0, 0,1,0);

                texCoords.push(0,u,       1,u,  0,u+0.25);
                texCoords.push(0,u+0.25,  1,u,  1,u+0.25);
              }
            }
          
            var y;
            for (var x = 0; x < meadow.getWidth(); x++) {
              for (var z = 0; z < meadow.getDepth(); z++) {
                y = 0;
                
                for (var i = 0; i < 1.0; i += s* 1.0/density) {
                  for (var j = 0; j < 1.0; j += s * 1.0/density) {
                    var ofsx = Math.random() * (density*2) - density;
                    var ofsz = Math.random() * (density*2) - density;
                    addQuad(0,               x+i+ofsx, y, z+j+ofsz);
                    addQuad(2*Math.PI/3,     x+i+ofsx, y, z+j+ofsz);
                    addQuad(4*Math.PI/3,     x+i+ofsx, y, z+j+ofsz);
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
