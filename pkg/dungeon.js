var ApplicationController = (function() {
  return Jax.Controller.create("application", Jax.Controller, {

  });
})();

var DungeonController = (function() {
  return Jax.Controller.create("dungeon", ApplicationController, {
    index: function() {
      var material = Jax.Material.find("rock");
      material.layers[0].texture.options.wrap_s = GL_REPEAT;
      material.layers[0].texture.options.wrap_t = GL_REPEAT;
      material.layers[1].map.options.wrap_s = GL_REPEAT;
      material.layers[1].map.options.wrap_t = GL_REPEAT;
      this.movement = { left: 0, right: 0, forward: 0, backward: 0 };

      var dungeon = new Dungeon();
      dungeon.mesh.material = material;
      dungeon.orientPlayer(this.player);

      this.world.addObject(dungeon);
      dungeon.addTorches("torch", this.world);
    },

    update: function(timechange) {
      this.player.camera.move((this.movement.forward+this.movement.backward)*timechange);
      this.player.camera.strafe((this.movement.left+this.movement.right)*timechange);
      var pos = this.player.camera.getPosition();
      pos[1] = 0.5; // set Y value in case it changed
      this.player.camera.orient(this.player.camera.getViewVector(), [0,1,0], pos);
    },

    mouse_moved: function(event) {
      this.context.player.camera.rotate(0.05, this.context.mouse.diffy, -this.context.mouse.diffx, 0);
    },

    key_down: function(event) {
      switch(event.keyCode) {
        case KeyEvent.DOM_VK_UP:
        case KeyEvent.DOM_VK_W:
          this.movement.forward = 1;
          break;
        case KeyEvent.DOM_VK_DOWN:
        case KeyEvent.DOM_VK_S:
          this.movement.backward = -1;
          break;
        case KeyEvent.DOM_VK_LEFT:
        case KeyEvent.DOM_VK_A:
          this.movement.left = -1;
          break;
        case KeyEvent.DOM_VK_RIGHT:
        case KeyEvent.DOM_VK_D:
          this.movement.right = 1;
          break;
      }
    },

    key_released: function(event) {
      switch(event.keyCode) {
        case KeyEvent.DOM_VK_UP:
        case KeyEvent.DOM_VK_W:
          this.movement.forward = 0;
          break;
        case KeyEvent.DOM_VK_DOWN:
        case KeyEvent.DOM_VK_S:
          this.movement.backward = 0;
          break;
        case KeyEvent.DOM_VK_LEFT:
        case KeyEvent.DOM_VK_A:
          this.movement.left = 0;
          break;
        case KeyEvent.DOM_VK_RIGHT:
        case KeyEvent.DOM_VK_D:
          this.movement.right = 0;
          break;
      }
    }
  });
})();
var ApplicationHelper = Jax.ViewHelper.create({

});
var DungeonHelper = Jax.ViewHelper.create({

});
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
      $super({mesh:new DungeonMesh(this)});
    },

    orientPlayer: function(player) {
      var pos = this.playerStart.position.split(/,\s*/);
      var dir = this.playerStart.direction.split(/,\s*/);

      player.camera.setPosition([pos[0], 0.5, pos[1]]);
      player.camera.orient([dir[0], 0, dir[1]]);
    },

    addTorches: function(name, world) {
      var map = this.map;
      for (var y = 0; y < map.length; y++) {
        for (var x = 0; x < map[y].length; x++) {
          if (map[y][x] == "'") {
            var torch = LightSource.find(name);
            torch.camera.setPosition(x, 0.5, y);
            world.addLightSource(torch);
          }
        }
      }
    },

    after_initialize: function() {

    }
  });
})();
Jax.views.push('dungeon/index', function() {
  this.glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  this.world.render();
});
Dungeon.addResources({"default":{"map":["XXXXXXXXXXXXXXXXXXXXXX","X'  '  '  '  '  '  ' X","X XXXXXXXXXXXXXXXXXX X","X XXXX'  '  '  '  'X'X","X'  '  XXXXXXXXXXXXX X","XXXXXXXXXXXXXXXXXXXXXX"],"playerStart":{"position":"18, 3","direction":"-1, 0"}}});
LightSource.addResources({"torch":{"shadowcaster":true,"enabled":true,"position":{"x":-20,"y":0,"z":0},"direction":{"x":1,"y":0,"z":0},"type":"POINT_LIGHT","attenuation":{"constant":0,"linear":0,"quadratic":0.5},"color":{"ambient":{"red":0.3,"green":0.3,"blue":0.3,"alpha":1},"diffuse":{"red":0.35,"green":0.35,"blue":0.35,"alpha":1.0},"specular":{"red":0,"green":0,"blue":0,"alpha":0}}}});
Material.addResources({"rock":{"ambient":{"red":1.0,"green":1.0,"blue":1.0,"alpha":1.0},"diffuse":{"red":1.0,"green":1.0,"blue":1.0,"alpha":1.0},"specular":{"red":0.0,"green":0.0,"blue":0.0,"alpha":0.0},"shininess":10,"layers":[{"type":"Texture","path":"/public/images/rock.png","scale_x":1.0,"scale_y":1.0},{"type":"NormalMap","path":"/public/images/rockNormal.png","scale_x":1.0,"scale_y":1.0}]}});
Jax.routes.root(DungeonController, "index");
Jax.routes.map("dungeon/index", DungeonController, "index");
