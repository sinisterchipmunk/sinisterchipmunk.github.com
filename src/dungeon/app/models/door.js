/**
 * class Door < Jax.Model
 * 
 **/
var Door = (function() {
  return Jax.Model.create({
    highlight: function() { this.mesh.material = "door_highlighted"; },
    
    unhighlight: function() { this.mesh.material = "door"; },
    
    after_initialize: function() {
      this.mesh = new Jax.Mesh({
        init: function(vertices, colors, texCoords, normals) {
          this.draw_mode = GL_TRIANGLE_FAN;
          
          var topx = 1.0, topy = 1.0;
          function push(x,y) {
            // door is rigid so we already know z and normal
            vertices.push(x*topx,y*topy,0);
            normals.push(0,0,-1);
            var tx = (x+2)/3;
            var ty = (y+2)/3;
            if (tx > 1 || ty > 1 || tx < 0 || ty < 0) throw new Error("bad tx/ty: "+tx+", "+ty);
            texCoords.push(tx, ty);
          }
          
          // top arch
          var arch_vertex_count = 16;
          var angle = Math.PI;
          var amount = angle/arch_vertex_count;
          push(0,0);
          var x, y, firstx, firsty;
          for (var theta = 0; theta <= arch_vertex_count; theta++) {
            x = Math.cos(theta*amount);
            y = Math.sin(theta*amount);
            if (theta == 0) { firstx = x; firsty = y; }
            push(x,y);
          }
          // bottom vertices
          push(x, -2);
          push(firstx, -2);
         
          // close the fan
          push(firstx, firsty);
        }
      });
      
      this.unhighlight();
    }
  });
})();
