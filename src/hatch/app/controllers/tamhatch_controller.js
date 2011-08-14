//= require "application_controller"

var TamhatchController = (function() {
  return Jax.Controller.create("tamhatch", ApplicationController, {
    index: function() {
      this.movement = { left: 0, right: 0, forward: 0, backward: 0 };
      this.world.addObject(BlenderModel.find("table"));
      this.world.addObject(BlenderModel.find("chair1"));
      this.world.addObject(BlenderModel.find("chair2"));
      this.world.addObject(BlenderModel.find("fan-base"));
      var lightBulb = this.world.addObject(BlenderModel.find("lightbulb"));
      
      var plane = new Jax.Mesh.Quad({size:30,material:"tamhatch"});
      var buf = plane.getTextureCoordsBuffer();
      for (var i = 0; i < buf.js.length; i++)
        buf.js[i] *= 4;
      buf.refresh();
      this.world.addObject(new Jax.Model({mesh:plane,position:[15,0,0],direction:[1,0,0]}));
      this.world.addObject(new Jax.Model({mesh:plane,position:[-15,0,0],direction:[-1,0,0]}));
      this.world.addObject(new Jax.Model({mesh:plane,position:[0,6.15,0],direction:[0,1,0]}));
      this.world.addObject(new Jax.Model({mesh:plane,position:[0,-3,0],direction:[0,-1,0]}));
      this.world.addObject(new Jax.Model({mesh:plane,position:[0,0,15],direction:[0,0,1]}));
      this.world.addObject(new Jax.Model({mesh:plane,position:[0,0,-15],direction:[0,0,-1]}));
      
      this.fanBlades = [];

      var fanPos = this.fanPos = [[0, 5.55, 0.6], [0.6, 5.55, 0], [0, 5.55, -0.6], [-0.6, 5.55, 0]];
      for (var i = 0; i < 4; i++) {
        this.fanBlades[i] = this.world.addObject(BlenderModel.find("fan-blade"));
        this.fanBlades[i].camera.setPosition(fanPos[i]);
        this.fanBlades[i].camera.yaw((i-1) * Math.PI / 2);
      }
      
      // this.light = new Jax.Scene.LightSource({
      //   type: Jax.POINT_LIGHT,
      //   attenuation: { linear: 0.5 }
      // });
      // this.world.addLightSource(this.light);
      // this.lightBall = this.world.addObject(new Jax.Model({mesh:new Jax.Mesh.Sphere({radius:0.25})}));
      
      this.world.addLightSource(new Jax.Scene.LightSource({
        type: Jax.POINT_LIGHT,
        position: lightBulb.camera.getPosition(),
        attenuation: { linear: 0.15 }
      }));

     this.player.camera.reorient([0.95,0,1]);
     this.player.camera.setPosition([-9,3,-10]);
     this.player.camera.pitch(-Math.PI/32);
    },

    update: function(timechange) {
      var speed = 7;
      this.player.camera.move((this.movement.forward+this.movement.backward)*timechange*speed);
      this.player.camera.strafe((this.movement.left+this.movement.right)*timechange*speed);
            
      // make the ceiling fan spin
      var angle = Math.PI / 4 * timechange;
      this._angle = (this._angle || 0) - angle;
      
      var p = this._p = this._p || vec3.create();
      var sx, sz;
      // p[0] = Math.cos(-this._angle/3) * 12;
      // p[1] = 5;
      // p[2] = Math.sin(-this._angle/3) * 12;
      // this.light.camera.setPosition(p);
      // this.lightBall.camera.setPosition(p);
      
      for (var i = 0; i < 4; i++) {
        var radius = 0.6;
        sx = Math.cos(this._angle + ((i+1) * Math.PI/2)) * radius;
        sz = Math.sin(this._angle + ((i+1) * Math.PI/2)) * radius;
        if (i % 2 > 0) { sx *= -1; sz *= -1; }
        p[0] = sx;
        p[1] = 5.55;
        p[2] = sz;
        this.fanBlades[i].camera.setPosition(p);
        this.fanBlades[i].camera.yaw(angle);
      }
    },
    
    mouse_dragged: function(event) {
      this.player.camera.yaw(-0.01 * this.context.mouse.diffx);
      this.player.camera.pitch(0.01 * this.context.mouse.diffy);
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
    
    // Some special actions are fired whenever the corresponding input is
    // received from the user.
    // mouse_moved: function(event) {
      // this.light.camera.move()
     // this.light.camera.move(event.diffy / 75);
     // this.light.camera.strafe(event.diffx / 75);
    // }
  });
})();
