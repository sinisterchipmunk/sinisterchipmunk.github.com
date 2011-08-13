/**
 * class Dungeon < Jax.Model
 * 
 **/
var Dungeon = (function() {
  var DungeonMesh = Jax.Class.create(Jax.Mesh, {
    initialize: function($super, dungeon) {
      this.dungeon = dungeon;
      $super();
    },
    
    init: function(vertices, colors, texcoords, normals) {
      var ofs = 0.5; // offset from center of each grid node
      var map, row;
      
      function drawLeftWall(x, z) {
        vertices.push(x-ofs, -ofs, z-ofs); colors.push(1,1,1,1); texcoords.push(0,0); normals.push( 1, 0, 0);
        vertices.push(x-ofs, -ofs, z+ofs); colors.push(1,1,1,1); texcoords.push(1,0); normals.push( 1, 0, 0);
        vertices.push(x-ofs,  ofs, z-ofs); colors.push(1,1,1,1); texcoords.push(0,1); normals.push( 1, 0, 0);
        vertices.push(x-ofs,  ofs, z-ofs); colors.push(1,1,1,1); texcoords.push(0,1); normals.push( 1, 0, 0);
        vertices.push(x-ofs, -ofs, z+ofs); colors.push(1,1,1,1); texcoords.push(1,0); normals.push( 1, 0, 0);
        vertices.push(x-ofs,  ofs, z+ofs); colors.push(1,1,1,1); texcoords.push(1,1); normals.push( 1, 0, 0);

        /* ceiling - draw a half-arch in every direction that leads to a wall */
        var slices = 8, total_angle = Math.PI/2.0, s1, s2, t1, t2;
        for (var slice = 0; slice < slices; slice++) {
          s1 = s2 = t1 = t2 = 0;
          if (y < map.length-1 && x > 0 && map[y+1][x-1] != 'X') { t1 = t2 = 0.5; }
          if (y > 0 && x > 0 && map[y-1][x-1] != 'X') { s1 = s2 = 0.5; }
          
          var angle = total_angle/slices*slice, next_angle = total_angle/slices*(slice+1);
          var sin = Math.sin(angle), next_sin = Math.sin(next_angle),
              cos =-Math.cos(angle), next_cos =-Math.cos(next_angle);
          s1 *= 1+cos; t1 *= 1+cos; s2 *= 1+next_cos; t2 *= 1+next_cos;
          var v1 = 1/slices*slice, v2 = 1/slices*(slice+1);
          vertices.push(x-ofs+cos     *0.5+0.5,  ofs+sin,      z-ofs-s1); colors.push(1,1,1,1); texcoords.push(-s1,v1); normals.push(-     cos, -     sin, 0);
          vertices.push(x-ofs+cos     *0.5+0.5,  ofs+sin,      z+ofs+t1); colors.push(1,1,1,1); texcoords.push(1+t1,v1); normals.push(-     cos, -     sin, 0);
          vertices.push(x-ofs+next_cos*0.5+0.5,  ofs+next_sin, z-ofs-s2); colors.push(1,1,1,1); texcoords.push(-s2,v2); normals.push(-next_cos, -next_sin, 0);
          vertices.push(x-ofs+next_cos*0.5+0.5,  ofs+next_sin, z-ofs-s2); colors.push(1,1,1,1); texcoords.push(-s2,v2); normals.push(-next_cos, -next_sin, 0);
          vertices.push(x-ofs+cos     *0.5+0.5,  ofs+sin,      z+ofs+t1); colors.push(1,1,1,1); texcoords.push(1+t1,v1); normals.push(-     cos, -     sin, 0);
          vertices.push(x-ofs+next_cos*0.5+0.5,  ofs+next_sin, z+ofs+t2); colors.push(1,1,1,1); texcoords.push(1+t2,v2); normals.push(-next_cos, -next_sin, 0);
        }
      }
      
      function drawFrontWall(x, z) {
        vertices.push(x-ofs, -ofs, z-ofs); colors.push(1,1,1,1); texcoords.push(0,0); normals.push( 0, 0, 1);
        vertices.push(x+ofs, -ofs, z-ofs); colors.push(1,1,1,1); texcoords.push(1,0); normals.push( 0, 0, 1);
        vertices.push(x-ofs,  ofs, z-ofs); colors.push(1,1,1,1); texcoords.push(0,1); normals.push( 0, 0, 1);
        vertices.push(x-ofs,  ofs, z-ofs); colors.push(1,1,1,1); texcoords.push(0,1); normals.push( 0, 0, 1);
        vertices.push(x+ofs, -ofs, z-ofs); colors.push(1,1,1,1); texcoords.push(1,0); normals.push( 0, 0, 1);
        vertices.push(x+ofs,  ofs, z-ofs); colors.push(1,1,1,1); texcoords.push(1,1); normals.push( 0, 0, 1);

        /* ceiling - draw a half-arch in every direction that leads to a wall */
        var slices = 8, total_angle = Math.PI/2.0, s1, s2, t1, t2;
        for (var slice = 0; slice < slices; slice++) {
          s1 = s2 = t1 = t2 = 0;
          if (x < row.length-1 && y > 0 && map[y-1][x+1] != 'X') { t1 = t2 = 0.5; }
          if (x > 0 && y > 0 && map[y-1][x-1] != 'X') { s1 = s2 = 0.5; }
          
          var angle = total_angle/slices*slice, next_angle = total_angle/slices*(slice+1);
          var sin = Math.sin(angle), next_sin = Math.sin(next_angle),
              cos =-Math.cos(angle), next_cos =-Math.cos(next_angle);
          s1 *= 1+cos; t1 *= 1+cos; s2 *= 1+next_cos; t2 *= 1+next_cos;
          var v1 = 1/slices*slice, v2 = 1/slices*(slice+1);
          vertices.push(x-ofs-s1,  ofs+sin,      z-ofs+cos     *0.5+0.5); colors.push(1,1,1,1); texcoords.push(-s1,v1); normals.push( 0, -     sin, -     cos);
          vertices.push(x+ofs+t1,  ofs+sin,      z-ofs+cos     *0.5+0.5); colors.push(1,1,1,1); texcoords.push(1+t1,v1); normals.push( 0, -     sin, -     cos);
          vertices.push(x-ofs-s2,  ofs+next_sin, z-ofs+next_cos*0.5+0.5); colors.push(1,1,1,1); texcoords.push(-s2,v2); normals.push( 0, -next_sin, -next_cos);
          vertices.push(x-ofs-s2,  ofs+next_sin, z-ofs+next_cos*0.5+0.5); colors.push(1,1,1,1); texcoords.push(-s2,v2); normals.push( 0, -next_sin, -next_cos);
          vertices.push(x+ofs+t1,  ofs+sin,      z-ofs+cos     *0.5+0.5); colors.push(1,1,1,1); texcoords.push(1+t1,v1); normals.push( 0, -     sin, -     cos);
          vertices.push(x+ofs+t2,  ofs+next_sin, z-ofs+next_cos*0.5+0.5); colors.push(1,1,1,1); texcoords.push(1+t2,v2); normals.push( 0, -next_sin, -next_cos);
        }
      }
      
      function drawRightWall(x, z) {
        vertices.push(x+ofs, -ofs, z-ofs); colors.push(1,1,1,1); texcoords.push(0,0); normals.push(-1, 0, 0);
        vertices.push(x+ofs, -ofs, z+ofs); colors.push(1,1,1,1); texcoords.push(1,0); normals.push(-1, 0, 0);
        vertices.push(x+ofs,  ofs, z-ofs); colors.push(1,1,1,1); texcoords.push(0,1); normals.push(-1, 0, 0);
        vertices.push(x+ofs,  ofs, z-ofs); colors.push(1,1,1,1); texcoords.push(0,1); normals.push(-1, 0, 0);
        vertices.push(x+ofs, -ofs, z+ofs); colors.push(1,1,1,1); texcoords.push(1,0); normals.push(-1, 0, 0);
        vertices.push(x+ofs,  ofs, z+ofs); colors.push(1,1,1,1); texcoords.push(1,1); normals.push(-1, 0, 0);

        /* ceiling - draw a half-arch in every direction that leads to a wall */
        var slices = 8, total_angle = Math.PI/2.0, s1, s2, t1, t2;
        for (var slice = 0; slice < slices; slice++) {
          s1 = s2 = t1 = t2 = 0;
          if (y < map.length-1 && x < row.length-1 && map[y+1][x+1] != 'X') { t1 = t2 = 0.5; }
          if (y > 0 && x < row.length-1 && map[y-1][x+1] != 'X') { s1 = s2 = 0.5; }
          
          var angle = total_angle/slices*slice, next_angle = total_angle/slices*(slice+1);
          var sin = Math.sin(angle), next_sin = Math.sin(next_angle),
              cos = Math.cos(angle), next_cos = Math.cos(next_angle);
          s1 *= 1-cos; t1 *= 1-cos; s2 *= 1-next_cos; t2 *= 1-next_cos;
          var v1 = 1/slices*slice, v2 = 1/slices*(slice+1);
          vertices.push(x+ofs+cos     *0.5-0.5,  ofs+sin,      z-ofs-s1); colors.push(1,1,1,1); texcoords.push(-s1,v1); normals.push(-     cos, -     sin, 0);
          vertices.push(x+ofs+cos     *0.5-0.5,  ofs+sin,      z+ofs+t1); colors.push(1,1,1,1); texcoords.push(1+t1,v1); normals.push(-     cos, -     sin, 0);
          vertices.push(x+ofs+next_cos*0.5-0.5,  ofs+next_sin, z-ofs-s2); colors.push(1,1,1,1); texcoords.push(-s2,v2); normals.push(-next_cos, -next_sin, 0);
          vertices.push(x+ofs+next_cos*0.5-0.5,  ofs+next_sin, z-ofs-s2); colors.push(1,1,1,1); texcoords.push(-s2,v2); normals.push(-next_cos, -next_sin, 0);
          vertices.push(x+ofs+cos     *0.5-0.5,  ofs+sin,      z+ofs+t1); colors.push(1,1,1,1); texcoords.push(1+t1,v1); normals.push(-     cos, -     sin, 0);
          vertices.push(x+ofs+next_cos*0.5-0.5,  ofs+next_sin, z+ofs+t2); colors.push(1,1,1,1); texcoords.push(1+t2,v2); normals.push(-next_cos, -next_sin, 0);
        }
      }
      
      function drawBackWall(x, z) {
        vertices.push(x-ofs, -ofs, z+ofs); colors.push(1,1,1,1); texcoords.push(0,0); normals.push( 0, 0,-1);
        vertices.push(x+ofs, -ofs, z+ofs); colors.push(1,1,1,1); texcoords.push(1,0); normals.push( 0, 0,-1);
        vertices.push(x-ofs,  ofs, z+ofs); colors.push(1,1,1,1); texcoords.push(0,1); normals.push( 0, 0,-1);
        vertices.push(x-ofs,  ofs, z+ofs); colors.push(1,1,1,1); texcoords.push(0,1); normals.push( 0, 0,-1);
        vertices.push(x+ofs, -ofs, z+ofs); colors.push(1,1,1,1); texcoords.push(1,0); normals.push( 0, 0,-1);
        vertices.push(x+ofs,  ofs, z+ofs); colors.push(1,1,1,1); texcoords.push(1,1); normals.push( 0, 0,-1);
        
        /* ceiling - draw a half-arch in every direction that leads to a wall */
        var slices = 8, total_angle = Math.PI/2.0, s1, s2, t1, t2;
        for (var slice = 0; slice < slices; slice++) {
          s1 = s2 = t1 = t2 = 0;
          if (x < row.length-1 && y < map.length-1 && map[y+1][x+1] != 'X') { t1 = t2 = 0.5; }
          if (x > 0 && y < map.length-1 && map[y+1][x-1] != 'X') { s1 = s2 = 0.5; }
          
          var angle = total_angle/slices*slice, next_angle = total_angle/slices*(slice+1);
          var sin = Math.sin(angle), next_sin = Math.sin(next_angle),
              cos = Math.cos(angle), next_cos = Math.cos(next_angle);
          s1 *= 1-cos; t1 *= 1-cos; s2 *= 1-next_cos; t2 *= 1-next_cos;
          var v1 = 1/slices*slice, v2 = 1/slices*(slice+1);
          vertices.push(x-ofs-s1,  ofs+sin,      z+ofs+cos     *0.5-0.5); colors.push(1,1,1,1); texcoords.push(-s1,v1); normals.push( 0, -     sin, -     cos);
          vertices.push(x+ofs+t1,  ofs+sin,      z+ofs+cos     *0.5-0.5); colors.push(1,1,1,1); texcoords.push(1+t1,v1); normals.push( 0, -     sin, -     cos);
          vertices.push(x-ofs-s2,  ofs+next_sin, z+ofs+next_cos*0.5-0.5); colors.push(1,1,1,1); texcoords.push(-s2,v2); normals.push( 0, -next_sin, -next_cos);
          vertices.push(x-ofs-s2,  ofs+next_sin, z+ofs+next_cos*0.5-0.5); colors.push(1,1,1,1); texcoords.push(-s2,v2); normals.push( 0, -next_sin, -next_cos);
          vertices.push(x+ofs+t1,  ofs+sin,      z+ofs+cos     *0.5-0.5); colors.push(1,1,1,1); texcoords.push(1+t1,v1); normals.push( 0, -     sin, -     cos);
          vertices.push(x+ofs+t2,  ofs+next_sin, z+ofs+next_cos*0.5-0.5); colors.push(1,1,1,1); texcoords.push(1+t2,v2); normals.push( 0, -next_sin, -next_cos);
        }
      }
      
      map = this.dungeon.map;
      for (var y = 0; y < map.length; y++) {
        row = map[y];
        for (var x = 0; x < row.length; x++) {
          var ch = row[x];
          if (ch == 'X') {
          } else {
            /* walls */
            if (x == 0 || row[x-1] == 'X') drawLeftWall(x, y);
            if (y == 0 || map[y-1][x] == 'X') drawFrontWall(x, y);
            if (x == row.length-1 || row[x+1] == 'X') drawRightWall(x, y);
            if (y == map.length-1 || map[y+1][x] == 'X') drawBackWall(x, y);
            
            /* floor */
            vertices.push(x-0.5,-0.5,y+0.5,  x-0.5,-0.5,y-0.5,  x+0.5,-0.5,y-0.5);
            vertices.push(x-0.5,-0.5,y+0.5,  x+0.5,-0.5,y-0.5,  x+0.5,-0.5,y+0.5);
            colors.push(1,1,1,1,  1,1,1,1,  1,1,1,1); colors.push(1,1,1,1,  1,1,1,1,  1,1,1,1);
            texcoords.push(0,1,  0,0,  1,0);          texcoords.push(0,1,  1,0,  1,1);
            normals.push(0,1,0,  0,1,0,  0,1,0);      normals.push(0,1,0,  0,1,0,  0,1,0);
            
          }
        }
      }
    }
  });
  
  return Jax.Model.create({
    initialize: function($super) {
      this.torches = [];
      $super({mesh:new DungeonMesh(this)});
    },
    
    // Attempts to "walk" from oldPos to newPos. If an obstacle (e.g. a wall) is in the way,
    // the nearest possible non-colliding position is returned; else, newPos is returned.
    walk: function(oldPos, newPos) {
      /* NOT YET WORKING */
      return newPos;
      /*
      var x = Math.round(oldPos[0]), y = Math.round(oldPos[2]);
      var current = oldPos;
      var dx = Math.abs(Math.round(newPos[0])-x), dy = Math.abs(Math.round(newPos[2])-y);
      var sx, sy;
      if (oldPos[0] < newPos[0]) sx = 1; else sx = -1;
      if (oldPos[2] < newPos[2]) sy = 1; else sy = -1;
      var err = dx - dy;
      
      while (true) {
        current[0] = x;
        current[2] = y;
        if (x == Math.round(newPos[0]) && y == Math.round(newPos[2]))
          return newPos;
        var e2 = 2*err;
        if (e2 > -dy) {
          err = err - dy;
          x = x + sx;
        }
        if (e2 < dx) {
          err = err + dx;
          y = y + sy;
        }
        // check for collision
        if (x < 0 || x == this.map[0].length-1 || y < 0 || y == this.map.length-1) {
          if (x < 0)                          vec3.add(current, [-0.48, 0, 0]);
          else if (x == this.map[0].length-1) vec3.add(current, [ 0.48, 0, 0]);
          if (y < 0)                          vec3.add(current, [ 0,    0, -0.48]);
          else if (y == this.map.length-1)    vec3.add(current, [ 0,    0,  0.48]);
          return current;
        }
      }
      */
    },
    
    orientPlayer: function(player) {
      var pos = this.player_start.position.split(/,\s*/);
      var dir = this.player_start.direction.split(/,\s*/);
      
      player.camera.setPosition([pos[0], 0.5, pos[1]]);
      player.camera.reorient([dir[0], 0, dir[1]]);
    },
    
    addTorches: function(name, world) {
      var map = this.map;
      var blenderTorch = BlenderModel.find("torch");
      var mesh = blenderTorch.mesh;
      var torchfire = this.torchfire = new Torchfire();
      // world.addObject(torchfire);
      
      // var mesh = new Jax.Mesh.Sphere({radius:0.05});
      for (var y = 0; y < map.length; y++) {
        for (var x = 0; x < map[y].length; x++) {
          if (map[y][x] == "'") {
            var torch = LightSource.find(name);
            // torch.camera.setPosition(x, 0.5, y);
            torch.original_attenuation = torch.attenuation.quadratic;
            this.torches.push(torch);
            world.addLightSource(torch);
            
            // find a wall to affix the torch model to
            var distance = 0.37;
            var _x = x, _y = y;
            var emitterOffset = [0, 0.325, 0];
            if (x == 0 || map[y][x-1] == 'X') { _x -= distance; emitterOffset[0] = 0.05; } // wall left
            else if (y == 0 || map[y-1][x] == 'X') { _y -= distance; emitterOffset[2] = 0.05; } // wall front
            else if (x == map[y].length-1 || map[y][x+1] == 'X') { _x += distance; emitterOffset[0] = -0.05; } // wall right
            else if (y == map.length-1 || map[y+1][x] == 'X') { _y += distance; emitterOffset[2] = -0.05; } // wall back
            // if no wall was found, don't draw a mesh. The light will still glow,
            // though.
            else continue;
            
            var height = 0.5;
            var torchModel = world.addObject(new Jax.Model({mesh:mesh,position:[_x, height, _y]}));
            torchModel.camera.lookAt([x, height, y]);
            var emitterPosition = vec3.add([_x, height, _y], emitterOffset);
            torch.camera.setPosition(emitterPosition);
            torchfire.addEmitter(emitterPosition);
          }
        }
      }
    },
    
    update: function(tc) {
      for (var i = 0; i < this.torches.length; i++) {
        var torch = this.torches[i];
        if (!torch.targetAtten || torch.attenDirection * (torch.targetAtten - torch.attenuation.quadratic) <= Math.EPSILON) {
          var amount = Math.random() * torch.flicker - torch.flicker / 2;
          torch.targetAtten = torch.original_attenuation + amount;
          torch.attenSpeed = (torch.targetAtten - torch.attenuation.quadratic) * 10;
          torch.attenDirection = torch.attenSpeed / Math.abs(torch.attenSpeed);
        }
        torch.attenuation.quadratic += torch.attenSpeed * tc;
        // deal with big tc values
        if ((torch.attenuation.quadratic < torch.targetAtten && Math.equalish(torch.attenDirection, -1)) ||
            (torch.attenuation.quadratic > torch.targetAtten && Math.equalish(torch.attenDirection,  1)))
          torch.attenuation.quadratic = torch.targetAtten;
      }
    },
    
    after_initialize: function() {
      
    }
  });
})();
