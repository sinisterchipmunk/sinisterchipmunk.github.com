Jax.environment = Jax.PRODUCTION;


var ApplicationController = (function() {
  return Jax.Controller.create("application", Jax.Controller, {

  });
})();
var DungeonController = (function() {
var material;
  return Jax.Controller.create("dungeon", ApplicationController, {
    index: function() {
      material = Jax.Material.find("rock");
      this.movement = { left: 0, right: 0, forward: 0, backward: 0 };

      this.dungeon = new Dungeon();
      this.dungeon.mesh.material = material;
      this.dungeon.orientPlayer(this.player);

      this.world.addObject(this.dungeon);
      this.dungeon.addTorches("torch", this.world);

      this.world.addLightSource(window.lantern = LightSource.find("lantern"));
    },

    update: function(timechange) {
      var speed = 1.5;

      var previousPosition = this.player.camera.getPosition();
      this.player.camera.move((this.movement.forward+this.movement.backward)*timechange*speed);
      this.player.camera.strafe((this.movement.left+this.movement.right)*timechange*speed);
      var pos = this.player.camera.getPosition();
      pos[1] = 0.5; // set Y value in case it changed
      this.player.camera.orient(this.player.camera.getViewVector(), [0,1,0], pos);

      var newpos = this.player.camera.getPosition();

      this.player.camera.setPosition(this.dungeon.walk(previousPosition, newpos));

      window.lantern.camera.setPosition(vec3.add(this.player.camera.getPosition(), vec3.scale(this.player.camera.getViewVector(), 0.1)));
    },

    mouse_moved: function(event) {
      this.context.player.camera.rotate(0.01, this.context.mouse.diffy, -this.context.mouse.diffx, 0);
    },

    key_pressed: function(event) {
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
var ApplicationHelper = Jax.Helper.create({

});
var DungeonHelper = Jax.Helper.create({

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
Jax.shaders['basic'] = new Jax.Shader({  common:"shared uniform mat4 ivMatrix, mvMatrix, pMatrix, vMatrix;\nshared uniform mat3 vnMatrix, nMatrix;\n\nshared uniform vec4 materialDiffuse, materialAmbient, materialSpecular;\nshared uniform float materialShininess;\n\nshared uniform int PASS_TYPE;\n\nshared varying vec2 vTexCoords;\nshared varying vec3 vNormal, vSurfacePos;\nshared varying vec4 vBaseColor;\n",
  fragment:"void main(inout vec4 ambient, inout vec4 diffuse, inout vec4 specular) {\n  ambient = materialAmbient * vBaseColor;\n  diffuse = materialDiffuse * vBaseColor;\n  specular = materialSpecular * vBaseColor;\n}\n",
  vertex:"shared attribute vec2 VERTEX_TEXCOORDS;\nshared attribute vec3 VERTEX_NORMAL;\nshared attribute vec4 VERTEX_POSITION, VERTEX_COLOR, VERTEX_TANGENT;\n\nvoid main(void) {\n  vBaseColor = VERTEX_COLOR;\n  vNormal = nMatrix * VERTEX_NORMAL;\n  vTexCoords = VERTEX_TEXCOORDS;\n                          \n  vSurfacePos = (mvMatrix * VERTEX_POSITION).xyz;\n\n  gl_Position = pMatrix * mvMatrix * VERTEX_POSITION;\n}\n",
exports: {},
name: "basic"});
Jax.shaders['depthmap'] = new Jax.Shader({  common:"shared uniform mat4 pMatrix;\n",
  fragment:"      #ifndef dependency____functions_depth_map\n      #define dependency____functions_depth_map\n      \n      vec4 pack_depth(const in float depth)\n{\n  const vec4 bit_shift = vec4(256.0*256.0*256.0, 256.0*256.0, 256.0, 1.0);\n  const vec4 bit_mask  = vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0);\n  vec4 res = fract(depth * bit_shift);\n  res -= res.xxyz * bit_mask;\n  return res;\n}\n\n/*\nfloat linearize(in float z) {\n  float A = pMatrix[2].z, B = pMatrix[3].z;\n  float n = - B / (1.0 - A); // camera z near\n  float f =   B / (1.0 + A); // camera z far\n  return (2.0 * n) / (f + n - z * (f - n));\n}\n*/\n\nfloat unpack_depth(const in vec4 rgba_depth)\n{\n  const vec4 bit_shift = vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0);\n  float depth = dot(rgba_depth, bit_shift);\n  return depth;\n}\n\n      #endif\n\n\nvoid main(void) {\n  gl_FragColor = pack_depth(gl_FragCoord.z);\n}\n",
  vertex:"shared attribute vec4 VERTEX_POSITION;\n    \nshared uniform mat4 mvMatrix;\n            \nvoid main(void) {\n  gl_Position = pMatrix * mvMatrix * VERTEX_POSITION;\n}\n",
exports: {},
name: "depthmap"});
Jax.shaders['fog'] = new Jax.Shader({  common:"uniform vec4 FogColor;\n\nuniform int Algorithm;\n\nuniform float Scale;\nuniform float End;\nuniform float Density;\n",
  fragment:"const float LOG2 = 1.442695;\n\nvoid main(inout vec4 ambient, inout vec4 diffuse, inout vec4 specular) {\n  float fog;\n  float distance = length(gl_FragCoord.z / gl_FragCoord.w);\n\n  if (Algorithm == <%=Jax.LINEAR%>) {\n    fog = (End - distance) * Scale;\n  } else if (Algorithm == <%=Jax.EXPONENTIAL%>) {\n    fog = exp(-Density * distance);\n  } else if (Algorithm == <%=Jax.EXP2%>) {\n    fog = exp2(-Density * Density * distance * distance * LOG2);\n  } else {\n    /* error condition, output red */\n    ambient = diffuse = specular = vec4(1,0,0,1);\n    return;\n  }\n\n  fog = clamp(fog, 0.0, 1.0);\n  \n  ambient  = mix(FogColor,  ambient,  fog);\n  diffuse  = mix(FogColor,  diffuse,  fog);\n}\n",
  vertex:"shared attribute vec4 VERTEX_POSITION;\n\nshared uniform mat4 mvMatrix, pMatrix;\n\nconst float LOG2 = 1.442695;\n\nvoid main(void) {\n  vec4 pos = mvMatrix * VERTEX_POSITION;\n  gl_Position = pMatrix * pos;\n}\n",
exports: {},
name: "fog"});
Jax.shaders['lighting'] = new Jax.Shader({  common:"      #ifndef dependency____functions_lights\n      #define dependency____functions_lights\n      \n      /* see http://jax.thoughtsincomputation.com/2011/05/webgl-apps-crashing-on-windows-7/ */\n//const struct LightSource {\n//  int enabled;\n//  int type;\n//  vec3 position; // in world space\n//  vec3 direction; // in world space\n//  vec4 ambient, diffuse, specular;\n//  float constant_attenuation, linear_attenuation, quadratic_attenuation;\n//  float spotExponent, spotCosCutoff;\n//};\n\nshared uniform bool LIGHT_ENABLED;\nshared uniform int LIGHT_TYPE;\nshared uniform vec3 LIGHT_POSITION, LIGHT_DIRECTION;\nshared uniform vec4 LIGHT_AMBIENT, LIGHT_DIFFUSE, LIGHT_SPECULAR;\nshared uniform float LIGHT_ATTENUATION_CONSTANT, LIGHT_ATTENUATION_LINEAR, LIGHT_ATTENUATION_QUADRATIC,\n                     LIGHT_SPOT_EXPONENT, LIGHT_SPOT_COS_CUTOFF;\n\nfloat calcAttenuation(in vec3 ecPosition3,\n                      out vec3 lightDirection)\n{\n//  lightDirection = vec3(vnMatrix * -light.position) - ecPosition3;\n  lightDirection = vec3(ivMatrix * vec4(LIGHT_POSITION, 1.0)) - ecPosition3;\n  float d = length(lightDirection);\n  \n  return 1.0 / (LIGHT_ATTENUATION_CONSTANT + LIGHT_ATTENUATION_LINEAR * d + LIGHT_ATTENUATION_QUADRATIC * d * d);\n}\n\nvoid DirectionalLight(in vec3 normal,\n                      inout vec4 ambient,\n                      inout vec4 diffuse,\n                      inout vec4 specular)\n{\n  if (PASS_TYPE == <%=Jax.Scene.AMBIENT_PASS%>)\n    ambient += LIGHT_AMBIENT;\n  else {\n    vec3 nLDir = normalize(vnMatrix * -normalize(LIGHT_DIRECTION));\n    vec3 halfVector = normalize(nLDir + vec3(0,0,1));\n    float pf;\n    \n    float NdotD  = max(0.0, dot(normal, nLDir));\n    float NdotHV = max(0.0, dot(normal, halfVector));\n    \n    if (NdotD == 0.0) pf = 0.0;\n    else pf = pow(NdotHV, materialShininess);\n    \n    diffuse += LIGHT_DIFFUSE * NdotD;\n    specular += LIGHT_SPECULAR * pf;\n  }\n}\n\n/* Use when attenuation != (1,0,0) */\nvoid PointLightWithAttenuation(in vec3 ecPosition3,\n                               in vec3 normal,\n                               inout vec4 ambient,\n                               inout vec4 diffuse,\n                               inout vec4 specular)\n{\n  float NdotD; // normal . light direction\n  float NdotHV;// normal . half vector\n  float pf;    // specular factor\n  float attenuation;\n  vec3 VP;     // direction from surface to light position\n  vec3 halfVector; // direction of maximum highlights\n  \n  attenuation = calcAttenuation(ecPosition3, VP);\n  VP = normalize(VP);\n  \n  halfVector = normalize(VP+vec3(0,0,1));\n  NdotD = max(0.0, dot(normal, VP));\n  NdotHV= max(0.0, dot(normal, halfVector));\n  \n  if (NdotD == 0.0) pf = 0.0;\n  else pf = pow(NdotHV, materialShininess);\n\n  if (PASS_TYPE == <%=Jax.Scene.AMBIENT_PASS%>)\n    ambient += LIGHT_AMBIENT * attenuation;\n  else {\n    diffuse += LIGHT_DIFFUSE * NdotD * attenuation;\n    specular += LIGHT_SPECULAR * pf * attenuation;\n  }\n}\n\n/* Use for better performance when attenuation == (1,0,0) */\nvoid PointLightWithoutAttenuation(in vec3 ecPosition3,\n                                  in vec3 normal,\n                                  inout vec4 ambient,\n                                  inout vec4 diffuse,\n                                  inout vec4 specular)\n{\n  float NdotD; // normal . light direction\n  float NdotHV;// normal . half vector\n  float pf;    // specular factor\n  float d;     // distance from surface to light source\n  vec3 VP;     // direction from surface to light position\n  vec3 halfVector; // direction of maximum highlights\n  \n  VP = vec3(ivMatrix * vec4(LIGHT_POSITION, 1.0)) - ecPosition3;\n  d = length(VP);\n  VP = normalize(VP);\n  halfVector = normalize(VP+vec3(0,0,1));\n  NdotD = max(0.0, dot(normal, VP));\n  NdotHV= max(0.0, dot(normal, halfVector));\n  \n  if (NdotD == 0.0) pf = 0.0;\n  else pf = pow(NdotHV, materialShininess);\n  \n  if (PASS_TYPE == <%=Jax.Scene.AMBIENT_PASS%>)\n    ambient += LIGHT_AMBIENT;\n  else {\n    diffuse += LIGHT_DIFFUSE * NdotD;\n    specular += LIGHT_SPECULAR * pf;\n  }\n}\n\nvoid SpotLight(in vec3 ecPosition3,\n               in vec3 normal,\n               inout vec4 ambient,\n               inout vec4 diffuse,\n               inout vec4 specular)\n{\n  float NdotD; // normal . light direction\n  float NdotHV;// normal . half vector\n  float pf;    // specular factor\n  float attenuation;\n  vec3 VP;     // direction from surface to light position\n  vec3 halfVector; // direction of maximum highlights\n  float spotDot; // cosine of angle between spotlight\n  float spotAttenuation; // spotlight attenuation factor\n  \n  attenuation = calcAttenuation(ecPosition3, VP);\n  VP = normalize(VP);\n  \n  // See if point on surface is inside cone of illumination\n  spotDot = dot(-VP, normalize(vnMatrix*LIGHT_DIRECTION));\n  if (spotDot < LIGHT_SPOT_COS_CUTOFF)\n    spotAttenuation = 0.0;\n  else spotAttenuation = pow(spotDot, LIGHT_SPOT_EXPONENT);\n  \n  attenuation *= spotAttenuation;\n  \n  halfVector = normalize(VP+vec3(0,0,1));\n  NdotD = max(0.0, dot(normal, VP));\n  NdotHV= max(0.0, dot(normal, halfVector));\n  \n  if (NdotD == 0.0) pf = 0.0;\n  else pf = pow(NdotHV, materialShininess);\n  \n  if (PASS_TYPE == <%=Jax.Scene.AMBIENT_PASS%>)\n    ambient += LIGHT_AMBIENT * attenuation;\n  else {\n    diffuse += LIGHT_DIFFUSE * NdotD * attenuation;\n    specular += LIGHT_SPECULAR * pf * attenuation;\n  }\n}\n\n      #endif\n\n\nshared uniform bool LIGHTING_ENABLED;\n\nshared varying vec3 vLightDir;",
  fragment:"void main(inout vec4 ambient, inout vec4 diffuse, inout vec4 specular) {\n  vec4 _ambient = vec4(0), _diffuse = vec4(0), _specular = vec4(0);\n  \n  vec3 nNormal = normalize(vNormal);\n\n  if (LIGHTING_ENABLED) {\n    if (LIGHT_TYPE == <%=Jax.DIRECTIONAL_LIGHT%>)\n      DirectionalLight(nNormal, _ambient, _diffuse, _specular);\n    else\n      if (LIGHT_TYPE == <%=Jax.POINT_LIGHT%>)\n        if (LIGHT_ATTENUATION_CONSTANT == 1.0 && LIGHT_ATTENUATION_LINEAR == 0.0 && LIGHT_ATTENUATION_QUADRATIC == 0.0)\n          PointLightWithoutAttenuation(vSurfacePos, nNormal, _ambient, _diffuse, _specular);\n        else\n          PointLightWithAttenuation(vSurfacePos, nNormal, _ambient, _diffuse, _specular);\n    else\n      if (LIGHT_TYPE == <%=Jax.SPOT_LIGHT%>)\n        SpotLight(vSurfacePos, nNormal, _ambient, _diffuse, _specular);\n    else\n    { // error condition, output 100% red\n      gl_FragColor = vec4(1,0,0,1);\n      return;\n    }\n  } else {\n    _ambient = vec4(1,1,1,1);\n    _diffuse = _specular = vec4(0,0,0,0);\n  }\n\n  // is this correct??\n  if (_ambient.a != 0.0) _ambient.a = 1.0;\n  \n  ambient *= _ambient;\n  diffuse *= _diffuse;\n  specular *= _specular;\n}\n",
  vertex:"shared attribute vec2 VERTEX_TEXCOORDS;\nshared attribute vec3 VERTEX_NORMAL;\nshared attribute vec4 VERTEX_POSITION, VERTEX_COLOR, VERTEX_TANGENT;\n\nvoid main(void) {\n  vLightDir = normalize(vnMatrix * -normalize(LIGHT_DIRECTION));\n}\n",
exports: {},
name: "lighting"});
Jax.shaders['normal_map'] = new Jax.Shader({  common:"      #ifndef dependency____functions_lights\n      #define dependency____functions_lights\n      \n      /* see http://jax.thoughtsincomputation.com/2011/05/webgl-apps-crashing-on-windows-7/ */\n//const struct LightSource {\n//  int enabled;\n//  int type;\n//  vec3 position; // in world space\n//  vec3 direction; // in world space\n//  vec4 ambient, diffuse, specular;\n//  float constant_attenuation, linear_attenuation, quadratic_attenuation;\n//  float spotExponent, spotCosCutoff;\n//};\n\nshared uniform bool LIGHT_ENABLED;\nshared uniform int LIGHT_TYPE;\nshared uniform vec3 LIGHT_POSITION, LIGHT_DIRECTION;\nshared uniform vec4 LIGHT_AMBIENT, LIGHT_DIFFUSE, LIGHT_SPECULAR;\nshared uniform float LIGHT_ATTENUATION_CONSTANT, LIGHT_ATTENUATION_LINEAR, LIGHT_ATTENUATION_QUADRATIC,\n                     LIGHT_SPOT_EXPONENT, LIGHT_SPOT_COS_CUTOFF;\n\nfloat calcAttenuation(in vec3 ecPosition3,\n                      out vec3 lightDirection)\n{\n//  lightDirection = vec3(vnMatrix * -light.position) - ecPosition3;\n  lightDirection = vec3(ivMatrix * vec4(LIGHT_POSITION, 1.0)) - ecPosition3;\n  float d = length(lightDirection);\n  \n  return 1.0 / (LIGHT_ATTENUATION_CONSTANT + LIGHT_ATTENUATION_LINEAR * d + LIGHT_ATTENUATION_QUADRATIC * d * d);\n}\n\nvoid DirectionalLight(in vec3 normal,\n                      inout vec4 ambient,\n                      inout vec4 diffuse,\n                      inout vec4 specular)\n{\n  if (PASS_TYPE == <%=Jax.Scene.AMBIENT_PASS%>)\n    ambient += LIGHT_AMBIENT;\n  else {\n    vec3 nLDir = normalize(vnMatrix * -normalize(LIGHT_DIRECTION));\n    vec3 halfVector = normalize(nLDir + vec3(0,0,1));\n    float pf;\n    \n    float NdotD  = max(0.0, dot(normal, nLDir));\n    float NdotHV = max(0.0, dot(normal, halfVector));\n    \n    if (NdotD == 0.0) pf = 0.0;\n    else pf = pow(NdotHV, materialShininess);\n    \n    diffuse += LIGHT_DIFFUSE * NdotD;\n    specular += LIGHT_SPECULAR * pf;\n  }\n}\n\n/* Use when attenuation != (1,0,0) */\nvoid PointLightWithAttenuation(in vec3 ecPosition3,\n                               in vec3 normal,\n                               inout vec4 ambient,\n                               inout vec4 diffuse,\n                               inout vec4 specular)\n{\n  float NdotD; // normal . light direction\n  float NdotHV;// normal . half vector\n  float pf;    // specular factor\n  float attenuation;\n  vec3 VP;     // direction from surface to light position\n  vec3 halfVector; // direction of maximum highlights\n  \n  attenuation = calcAttenuation(ecPosition3, VP);\n  VP = normalize(VP);\n  \n  halfVector = normalize(VP+vec3(0,0,1));\n  NdotD = max(0.0, dot(normal, VP));\n  NdotHV= max(0.0, dot(normal, halfVector));\n  \n  if (NdotD == 0.0) pf = 0.0;\n  else pf = pow(NdotHV, materialShininess);\n\n  if (PASS_TYPE == <%=Jax.Scene.AMBIENT_PASS%>)\n    ambient += LIGHT_AMBIENT * attenuation;\n  else {\n    diffuse += LIGHT_DIFFUSE * NdotD * attenuation;\n    specular += LIGHT_SPECULAR * pf * attenuation;\n  }\n}\n\n/* Use for better performance when attenuation == (1,0,0) */\nvoid PointLightWithoutAttenuation(in vec3 ecPosition3,\n                                  in vec3 normal,\n                                  inout vec4 ambient,\n                                  inout vec4 diffuse,\n                                  inout vec4 specular)\n{\n  float NdotD; // normal . light direction\n  float NdotHV;// normal . half vector\n  float pf;    // specular factor\n  float d;     // distance from surface to light source\n  vec3 VP;     // direction from surface to light position\n  vec3 halfVector; // direction of maximum highlights\n  \n  VP = vec3(ivMatrix * vec4(LIGHT_POSITION, 1.0)) - ecPosition3;\n  d = length(VP);\n  VP = normalize(VP);\n  halfVector = normalize(VP+vec3(0,0,1));\n  NdotD = max(0.0, dot(normal, VP));\n  NdotHV= max(0.0, dot(normal, halfVector));\n  \n  if (NdotD == 0.0) pf = 0.0;\n  else pf = pow(NdotHV, materialShininess);\n  \n  if (PASS_TYPE == <%=Jax.Scene.AMBIENT_PASS%>)\n    ambient += LIGHT_AMBIENT;\n  else {\n    diffuse += LIGHT_DIFFUSE * NdotD;\n    specular += LIGHT_SPECULAR * pf;\n  }\n}\n\nvoid SpotLight(in vec3 ecPosition3,\n               in vec3 normal,\n               inout vec4 ambient,\n               inout vec4 diffuse,\n               inout vec4 specular)\n{\n  float NdotD; // normal . light direction\n  float NdotHV;// normal . half vector\n  float pf;    // specular factor\n  float attenuation;\n  vec3 VP;     // direction from surface to light position\n  vec3 halfVector; // direction of maximum highlights\n  float spotDot; // cosine of angle between spotlight\n  float spotAttenuation; // spotlight attenuation factor\n  \n  attenuation = calcAttenuation(ecPosition3, VP);\n  VP = normalize(VP);\n  \n  // See if point on surface is inside cone of illumination\n  spotDot = dot(-VP, normalize(vnMatrix*LIGHT_DIRECTION));\n  if (spotDot < LIGHT_SPOT_COS_CUTOFF)\n    spotAttenuation = 0.0;\n  else spotAttenuation = pow(spotDot, LIGHT_SPOT_EXPONENT);\n  \n  attenuation *= spotAttenuation;\n  \n  halfVector = normalize(VP+vec3(0,0,1));\n  NdotD = max(0.0, dot(normal, VP));\n  NdotHV= max(0.0, dot(normal, halfVector));\n  \n  if (NdotD == 0.0) pf = 0.0;\n  else pf = pow(NdotHV, materialShininess);\n  \n  if (PASS_TYPE == <%=Jax.Scene.AMBIENT_PASS%>)\n    ambient += LIGHT_AMBIENT * attenuation;\n  else {\n    diffuse += LIGHT_DIFFUSE * NdotD * attenuation;\n    specular += LIGHT_SPECULAR * pf * attenuation;\n  }\n}\n\n      #endif\n\n\nuniform sampler2D NormalMap;\n\nshared uniform mat4 mvMatrix, pMatrix, vMatrix;\nshared uniform mat3 nMatrix;\n\nshared varying vec2 vTexCoords;\n\nvarying vec3 vEyeDir;\nvarying vec3 vLightDir;\nvarying float vAttenuation;\n",
  fragment:"void main(inout vec4 ambient, inout vec4 diffuse, inout vec4 specular) {\n  // ambient was applied by the basic shader; applying it again will simply brighten some fragments\n  // beyond their proper ambient value. So, we really need to apply the bump shader ONLY to diffuse+specular.\n\n  if (PASS_TYPE == <%=Jax.Scene.AMBIENT_PASS%>) return;\n  \n  vec3 nLightDir = normalize(vLightDir);\n  vec3 nEyeDir = normalize(vEyeDir);\n  vec4 color = texture2D(NormalMap, vTexCoords);\n  vec3 map = //nMatrix * \n             normalize(color.xyz * 2.0 - 1.0);\n             \n  float litColor = max(dot(map, nLightDir), 0.0) * vAttenuation;\n\n  // specular\n  vec3 reflectDir = reflect(nLightDir, map);\n  float spec = max(dot(nEyeDir, reflectDir), 0.0);\n  spec = pow(spec, materialShininess);\n\n  // Treat alpha in the normal map as a specular map; if it's unused it will be 1 and this\n  // won't matter.\n  spec *= color.a;\n  \n  diffuse *= litColor;\n  specular *= spec;\n}\n",
  vertex:"shared attribute vec4 VERTEX_POSITION;\nshared attribute vec2 VERTEX_TEXCOORDS;\nshared attribute vec4 VERTEX_TANGENT;\nshared attribute vec3 VERTEX_NORMAL;\n\nvoid main(void) {\n  // ambient was applied by the basic shader; applying it again will simply brighten some fragments\n  // beyond their proper ambient value. So, we really need to apply the bump shader ONLY to diffuse+specular.\n\n  if (PASS_TYPE == <%=Jax.Scene.AMBIENT_PASS%>) return;\n\n  vec3 ecPosition = vec3(mvMatrix * VERTEX_POSITION);\n\n  gl_Position = pMatrix * mvMatrix * VERTEX_POSITION;\n  vTexCoords = VERTEX_TEXCOORDS;\n\n  vEyeDir = vec3(mvMatrix * VERTEX_POSITION);\n  \n  vec3 n = normalize(nMatrix * VERTEX_NORMAL);\n  vec3 t = normalize(nMatrix * VERTEX_TANGENT.xyz);\n  vec3 b = cross(n, t) * VERTEX_TANGENT.w;\n  \n  vec3 v, p;\n  \n  vAttenuation = 1.0;\n  \n  if (LIGHT_TYPE == <%=Jax.POINT_LIGHT%>)\n    if (LIGHT_ATTENUATION_CONSTANT == 1.0 && LIGHT_ATTENUATION_LINEAR == 0.0 && LIGHT_ATTENUATION_QUADRATIC == 0.0) {\n      // no change to attenuation, but we still need P\n      p = vec3(ivMatrix * vec4(LIGHT_POSITION, 1.0)) - ecPosition;\n    }\n    else {\n      // attenuation calculation figures out P for us, so we may as well use it\n      vAttenuation = calcAttenuation(ecPosition, p);\n    }\n  else\n    if (LIGHT_TYPE == <%=Jax.SPOT_LIGHT%>) {\n      // attenuation calculation figures out P for us, so we may as well use it\n      vAttenuation = calcAttenuation(ecPosition, p);\n    }\n    else\n    { // directional light -- all we need is P\n      p = vec3(vnMatrix * -normalize(LIGHT_DIRECTION));\n    }\n    \n    \n    \n  v.x = dot(p, t);\n  v.y = dot(p, b);\n  v.z = dot(p, n);\n  vLightDir = normalize(p);\n  \n  v.x = dot(vEyeDir, t);\n  v.y = dot(vEyeDir, b);\n  v.z = dot(vEyeDir, n);\n  vEyeDir = normalize(v);\n}\n",
exports: {},
name: "normal_map"});
Jax.shaders['paraboloid-depthmap'] = new Jax.Shader({  common:"shared uniform mat4 mvMatrix;\nshared uniform float DP_SHADOW_NEAR, DP_SHADOW_FAR;\nshared uniform float DP_DIRECTION;\n\nshared varying float vClip;\nshared varying vec4 vPos;\n",
  fragment:"      #ifndef dependency____functions_depth_map\n      #define dependency____functions_depth_map\n      \n      vec4 pack_depth(const in float depth)\n{\n  const vec4 bit_shift = vec4(256.0*256.0*256.0, 256.0*256.0, 256.0, 1.0);\n  const vec4 bit_mask  = vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0);\n  vec4 res = fract(depth * bit_shift);\n  res -= res.xxyz * bit_mask;\n  return res;\n}\n\n/*\nfloat linearize(in float z) {\n  float A = pMatrix[2].z, B = pMatrix[3].z;\n  float n = - B / (1.0 - A); // camera z near\n  float f =   B / (1.0 + A); // camera z far\n  return (2.0 * n) / (f + n - z * (f - n));\n}\n*/\n\nfloat unpack_depth(const in vec4 rgba_depth)\n{\n  const vec4 bit_shift = vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0);\n  float depth = dot(rgba_depth, bit_shift);\n  return depth;\n}\n\n      #endif\n\n\nvoid main(void) {\n  /* because we do our own projection, we also have to do our own clipping */\n  /* if vClip is less than 0, it's behind the near plane and can be dropped. */\n  if (vClip < 0.0) discard;\n  gl_FragColor = pack_depth(vPos.z);\n}\n",
  vertex:"shared attribute vec4 VERTEX_POSITION;\n                \nvoid main(void) {\n  /*\n    we do our own projection to form the paraboloid, so we\n    can ignore the projection matrix entirely.\n   */\n  vec4 pos = mvMatrix * VERTEX_POSITION;\n\n  pos = vec4(pos.xyz / pos.w, pos.w);\n\n  pos.z *= DP_DIRECTION;\n\n  float L = length(pos.xyz);\n  pos /= L;\n  vClip = pos.z;\n\n  pos.z += 1.0;\n  pos.x /= pos.z;\n  pos.y /= pos.z;\n  pos.z = (L - DP_SHADOW_NEAR) / (DP_SHADOW_FAR - DP_SHADOW_NEAR);\n  pos.w = 1.0;\n\n  vPos = pos;\n  gl_Position = pos;\n}\n",
exports: {},
name: "paraboloid-depthmap"});
Jax.shaders['shadow_map'] = new Jax.Shader({  common:"shared uniform mat4 mMatrix;\n\nuniform bool SHADOWMAP_ENABLED;\nuniform sampler2D SHADOWMAP0, SHADOWMAP1;\nuniform mat4 SHADOWMAP_MATRIX;\nuniform bool SHADOWMAP_PCF_ENABLED;\nuniform float DP_SHADOW_NEAR, DP_SHADOW_FAR;\n\nvarying vec4 vShadowCoord;\n\nvarying vec4 vDP0, vDP1;\n//varying float vDPz, vDPDepth;\n\n      #ifndef dependency____functions_lights\n      #define dependency____functions_lights\n      \n      /* see http://jax.thoughtsincomputation.com/2011/05/webgl-apps-crashing-on-windows-7/ */\n//const struct LightSource {\n//  int enabled;\n//  int type;\n//  vec3 position; // in world space\n//  vec3 direction; // in world space\n//  vec4 ambient, diffuse, specular;\n//  float constant_attenuation, linear_attenuation, quadratic_attenuation;\n//  float spotExponent, spotCosCutoff;\n//};\n\nshared uniform bool LIGHT_ENABLED;\nshared uniform int LIGHT_TYPE;\nshared uniform vec3 LIGHT_POSITION, LIGHT_DIRECTION;\nshared uniform vec4 LIGHT_AMBIENT, LIGHT_DIFFUSE, LIGHT_SPECULAR;\nshared uniform float LIGHT_ATTENUATION_CONSTANT, LIGHT_ATTENUATION_LINEAR, LIGHT_ATTENUATION_QUADRATIC,\n                     LIGHT_SPOT_EXPONENT, LIGHT_SPOT_COS_CUTOFF;\n\nfloat calcAttenuation(in vec3 ecPosition3,\n                      out vec3 lightDirection)\n{\n//  lightDirection = vec3(vnMatrix * -light.position) - ecPosition3;\n  lightDirection = vec3(ivMatrix * vec4(LIGHT_POSITION, 1.0)) - ecPosition3;\n  float d = length(lightDirection);\n  \n  return 1.0 / (LIGHT_ATTENUATION_CONSTANT + LIGHT_ATTENUATION_LINEAR * d + LIGHT_ATTENUATION_QUADRATIC * d * d);\n}\n\nvoid DirectionalLight(in vec3 normal,\n                      inout vec4 ambient,\n                      inout vec4 diffuse,\n                      inout vec4 specular)\n{\n  if (PASS_TYPE == <%=Jax.Scene.AMBIENT_PASS%>)\n    ambient += LIGHT_AMBIENT;\n  else {\n    vec3 nLDir = normalize(vnMatrix * -normalize(LIGHT_DIRECTION));\n    vec3 halfVector = normalize(nLDir + vec3(0,0,1));\n    float pf;\n    \n    float NdotD  = max(0.0, dot(normal, nLDir));\n    float NdotHV = max(0.0, dot(normal, halfVector));\n    \n    if (NdotD == 0.0) pf = 0.0;\n    else pf = pow(NdotHV, materialShininess);\n    \n    diffuse += LIGHT_DIFFUSE * NdotD;\n    specular += LIGHT_SPECULAR * pf;\n  }\n}\n\n/* Use when attenuation != (1,0,0) */\nvoid PointLightWithAttenuation(in vec3 ecPosition3,\n                               in vec3 normal,\n                               inout vec4 ambient,\n                               inout vec4 diffuse,\n                               inout vec4 specular)\n{\n  float NdotD; // normal . light direction\n  float NdotHV;// normal . half vector\n  float pf;    // specular factor\n  float attenuation;\n  vec3 VP;     // direction from surface to light position\n  vec3 halfVector; // direction of maximum highlights\n  \n  attenuation = calcAttenuation(ecPosition3, VP);\n  VP = normalize(VP);\n  \n  halfVector = normalize(VP+vec3(0,0,1));\n  NdotD = max(0.0, dot(normal, VP));\n  NdotHV= max(0.0, dot(normal, halfVector));\n  \n  if (NdotD == 0.0) pf = 0.0;\n  else pf = pow(NdotHV, materialShininess);\n\n  if (PASS_TYPE == <%=Jax.Scene.AMBIENT_PASS%>)\n    ambient += LIGHT_AMBIENT * attenuation;\n  else {\n    diffuse += LIGHT_DIFFUSE * NdotD * attenuation;\n    specular += LIGHT_SPECULAR * pf * attenuation;\n  }\n}\n\n/* Use for better performance when attenuation == (1,0,0) */\nvoid PointLightWithoutAttenuation(in vec3 ecPosition3,\n                                  in vec3 normal,\n                                  inout vec4 ambient,\n                                  inout vec4 diffuse,\n                                  inout vec4 specular)\n{\n  float NdotD; // normal . light direction\n  float NdotHV;// normal . half vector\n  float pf;    // specular factor\n  float d;     // distance from surface to light source\n  vec3 VP;     // direction from surface to light position\n  vec3 halfVector; // direction of maximum highlights\n  \n  VP = vec3(ivMatrix * vec4(LIGHT_POSITION, 1.0)) - ecPosition3;\n  d = length(VP);\n  VP = normalize(VP);\n  halfVector = normalize(VP+vec3(0,0,1));\n  NdotD = max(0.0, dot(normal, VP));\n  NdotHV= max(0.0, dot(normal, halfVector));\n  \n  if (NdotD == 0.0) pf = 0.0;\n  else pf = pow(NdotHV, materialShininess);\n  \n  if (PASS_TYPE == <%=Jax.Scene.AMBIENT_PASS%>)\n    ambient += LIGHT_AMBIENT;\n  else {\n    diffuse += LIGHT_DIFFUSE * NdotD;\n    specular += LIGHT_SPECULAR * pf;\n  }\n}\n\nvoid SpotLight(in vec3 ecPosition3,\n               in vec3 normal,\n               inout vec4 ambient,\n               inout vec4 diffuse,\n               inout vec4 specular)\n{\n  float NdotD; // normal . light direction\n  float NdotHV;// normal . half vector\n  float pf;    // specular factor\n  float attenuation;\n  vec3 VP;     // direction from surface to light position\n  vec3 halfVector; // direction of maximum highlights\n  float spotDot; // cosine of angle between spotlight\n  float spotAttenuation; // spotlight attenuation factor\n  \n  attenuation = calcAttenuation(ecPosition3, VP);\n  VP = normalize(VP);\n  \n  // See if point on surface is inside cone of illumination\n  spotDot = dot(-VP, normalize(vnMatrix*LIGHT_DIRECTION));\n  if (spotDot < LIGHT_SPOT_COS_CUTOFF)\n    spotAttenuation = 0.0;\n  else spotAttenuation = pow(spotDot, LIGHT_SPOT_EXPONENT);\n  \n  attenuation *= spotAttenuation;\n  \n  halfVector = normalize(VP+vec3(0,0,1));\n  NdotD = max(0.0, dot(normal, VP));\n  NdotHV= max(0.0, dot(normal, halfVector));\n  \n  if (NdotD == 0.0) pf = 0.0;\n  else pf = pow(NdotHV, materialShininess);\n  \n  if (PASS_TYPE == <%=Jax.Scene.AMBIENT_PASS%>)\n    ambient += LIGHT_AMBIENT * attenuation;\n  else {\n    diffuse += LIGHT_DIFFUSE * NdotD * attenuation;\n    specular += LIGHT_SPECULAR * pf * attenuation;\n  }\n}\n\n      #endif\n\n",
  fragment:"      #ifndef dependency____functions_depth_map\n      #define dependency____functions_depth_map\n      \n      vec4 pack_depth(const in float depth)\n{\n  const vec4 bit_shift = vec4(256.0*256.0*256.0, 256.0*256.0, 256.0, 1.0);\n  const vec4 bit_mask  = vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0);\n  vec4 res = fract(depth * bit_shift);\n  res -= res.xxyz * bit_mask;\n  return res;\n}\n\n/*\nfloat linearize(in float z) {\n  float A = pMatrix[2].z, B = pMatrix[3].z;\n  float n = - B / (1.0 - A); // camera z near\n  float f =   B / (1.0 + A); // camera z far\n  return (2.0 * n) / (f + n - z * (f - n));\n}\n*/\n\nfloat unpack_depth(const in vec4 rgba_depth)\n{\n  const vec4 bit_shift = vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0);\n  float depth = dot(rgba_depth, bit_shift);\n  return depth;\n}\n\n      #endif\n\n\nfloat dp_lookup() {\n  float map_depth, depth;\n  vec4 rgba_depth;\n      \n  if (vDP0.w > 0.0) {\n    rgba_depth = texture2D(SHADOWMAP0, vDP0.xy);\n    depth = vDP1.w;//P0.z;\n  } else {\n    rgba_depth = texture2D(SHADOWMAP1, vDP1.xy);\n    depth = vDP1.w;//P1.z;\n  }\n      \n      \n  map_depth = unpack_depth(rgba_depth);\n      \n  if (map_depth + 0.00005 < depth) return 0.0;\n  else return 1.0;\n}\n      \nfloat pcf_lookup(float s, vec2 offset) {\n  /*\n    s is the projected depth of the current vShadowCoord relative to the shadow's camera. This represents\n    a *potentially* shadowed surface about to be drawn.\n    \n    d is the actual depth stored within the SHADOWMAP texture (representing the visible surface).\n  \n    if the surface to be drawn is further back than the light-visible surface, then the surface is\n    shadowed because it has a greater depth. Less-or-equal depth means it's either in front of, or it *is*\n    the light-visible surface.\n  */\n  vec2 texcoord = (vShadowCoord.xy/vShadowCoord.w)+offset;\n  vec4 rgba_depth = texture2D(SHADOWMAP0, texcoord);\n  float d = unpack_depth(rgba_depth);\n  return (s - d > 0.00002) ? 0.0 : 1.0;\n}\n\nvoid main(inout vec4 ambient, inout vec4 diffuse, inout vec4 specular) {\n//ambient = vec4(0);\n  if (PASS_TYPE == <%=Jax.Scene.AMBIENT_PASS%> || !SHADOWMAP_ENABLED) return;\n  float visibility = 1.0;\n  float s = vShadowCoord.z / vShadowCoord.w;\n  if (LIGHT_TYPE == <%=Jax.POINT_LIGHT%>) {\n    visibility = dp_lookup();\n  } else {\n    vec2 offset = vec2(0.0, 0.0);\n    if (!SHADOWMAP_PCF_ENABLED)\n      visibility = pcf_lookup(s, offset);\n    else {\n      // do PCF filtering\n      float dx, dy;\n      visibility = 0.0;\n      for (float dx = -1.5; dx <= 1.5; dx += 1.0)\n        for (float dy = -1.5; dy <= 1.5; dy += 1.0) {\n          offset.x = dx/2048.0;\n          offset.y = dy/2048.0;\n          visibility += pcf_lookup(s, offset);\n        }\n      visibility /= 16.0;\n    }\n  }\n\n  diffuse *= visibility;\n  specular *= visibility;\n}\n",
  vertex:"void main(void) {\n  if (PASS_TYPE == <%=Jax.Scene.AMBIENT_PASS%> || !SHADOWMAP_ENABLED) return;\n\n  vShadowCoord = SHADOWMAP_MATRIX * mMatrix * VERTEX_POSITION;\n  \n//  if (LIGHT.type == <%=Jax.POINT_LIGHT%>) {\n    /* Perform dual-paraboloid shadow map calculations - for point lights only */\n    vec4 p = vShadowCoord;\n    vec3 pos = p.xyz / p.w;\n          \n    float L = length(pos.xyz);\n    vDP0.xyz = pos / L;\n    vDP1.xyz = pos / L;\n      \n    vDP0.w = pos.z;    \n    //vDPz = pos.z;\n          \n    vDP0.z = 1.0 + vDP0.z;\n    vDP0.x /= vDP0.z;\n    vDP0.y /= vDP0.z;\n    vDP0.z = (L - DP_SHADOW_NEAR) / (DP_SHADOW_FAR - DP_SHADOW_NEAR);\n          \n    vDP0.x =  0.5 * vDP0.x + 0.5;\n    vDP0.y =  0.5 * vDP0.y + 0.5;\n          \n    vDP1.z = 1.0 - vDP1.z;\n    vDP1.x /= vDP1.z;\n    vDP1.y /= vDP1.z;\n    vDP1.z = (L - DP_SHADOW_NEAR) / (DP_SHADOW_FAR - DP_SHADOW_NEAR);\n      \n    vDP1.x =  0.5 * vDP1.x + 0.5;\n    vDP1.y =  0.5 * vDP1.y + 0.5;\n          \n    float map_depth, depth;\n    vec4 rgba_depth;\n      \n    if (vDP0.w > 0.0) {    \n    //if (vDPz > 0.0) {\n      vDP1.w = vDP0.z;\n      //vDPDepth = vDP0.z;\n    } else {\n      vDP1.w = vDP1.z;\n      //vDPDepth = vDP1.z;\n    }\n//  }\n}\n",
exports: {},
name: "shadow_map"});
Jax.shaders['texture'] = new Jax.Shader({  common:"uniform sampler2D Texture;\nuniform float TextureScaleX, TextureScaleY;\n\nshared varying vec2 vTexCoords;\n",
  fragment:"void main(inout vec4 ambient, inout vec4 diffuse, inout vec4 specular) {\n  vec4 t = texture2D(Texture, vTexCoords * vec2(TextureScaleX, TextureScaleY));\n\n  ambient  *= t;\n  diffuse  *= t;\n  specular *= t;\n \n  ambient.a  *= t.a;\n  diffuse.a  *= t.a;\n  specular.a *= t.a;\n}\n",
  vertex:"shared attribute vec4 VERTEX_POSITION;\nshared attribute vec2 VERTEX_TEXCOORDS;\n\nshared uniform mat4 mvMatrix, pMatrix;\n\nvoid main(void) {\n  gl_Position = pMatrix * mvMatrix * VERTEX_POSITION;\n  vTexCoords = VERTEX_TEXCOORDS;\n}\n",
exports: {},
name: "texture"});
Dungeon.addResources({"default":{"map":["XXXXXXXXXXXXXXXXXXXXXX","X'     '     '     ' X","X XXXXXXXXXXXXXXXXXX X","X XXXX'     '     'X'X","X'     XXXXXXXXXXXXX X","XXXXXXXXXXXXXXXXXXXXXX"],"player_start":{"position":"18, 3","direction":"-1, 0"}}});
LightSource.addResources({"lantern":{"shadowcaster":true,"enabled":true,"position":{"x":-20,"y":0,"z":0},"type":"POINT_LIGHT","attenuation":{"constant":0,"linear":2,"quadratic":0},"color":{"ambient":{"red":0.3,"green":0.3,"blue":0.3,"alpha":1},"diffuse":{"red":0.35,"green":0.35,"blue":0.35,"alpha":1.0},"specular":{"red":0,"green":0,"blue":0,"alpha":0}}},"torch":{"shadowcaster":true,"enabled":true,"position":{"x":-20,"y":0,"z":0},"direction":{"x":1,"y":0,"z":0},"type":"POINT_LIGHT","attenuation":{"constant":0,"linear":0,"quadratic":0.5},"color":{"ambient":{"red":0.3,"green":0.3,"blue":0.3,"alpha":1},"diffuse":{"red":0.35,"green":0.35,"blue":0.35,"alpha":1.0},"specular":{"red":0,"green":0,"blue":0,"alpha":0}}}});
Material.addResources({"rock":{"ambient":{"red":1.0,"green":1.0,"blue":1.0,"alpha":1.0},"diffuse":{"red":1.0,"green":1.0,"blue":1.0,"alpha":1.0},"specular":{"red":0.0,"green":0.0,"blue":0.0,"alpha":0.0},"shininess":10,"layers":[{"type":"Lighting"},{"type":"Texture","path":"/images/rock.png","flip_y":false,"scale_x":1.0,"scale_y":1.0,"generate_mipmap":true,"min_filter":"GL_LINEAR","mag_filter":"GL_LINEAR","mipmap_hint":"GL_DONT_CARE","format":"GL_RGBA","data_type":"GL_UNSIGNED_BYTE","wrap_s":"GL_REPEAT","wrap_t":"GL_REPEAT","premultiply_alpha":false,"colorspace_conversion":true},{"type":"NormalMap","path":"/images/rockNormal.png","flip_y":false,"scale_x":1.0,"scale_y":1.0,"generate_mipmap":true,"min_filter":"GL_LINEAR","mag_filter":"GL_LINEAR","mipmap_hint":"GL_DONT_CARE","format":"GL_RGBA","data_type":"GL_UNSIGNED_BYTE","wrap_s":"GL_REPEAT","wrap_t":"GL_REPEAT","premultiply_alpha":false,"colorspace_conversion":true}]}});
Jax.routes.root(DungeonController, "index");
Jax.routes.map("dungeon/index", DungeonController, "index");
