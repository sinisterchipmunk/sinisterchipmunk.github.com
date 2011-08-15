//= require "application_controller"
var DungeonController = (function() {
var material;
  return Jax.Controller.create("dungeon", ApplicationController, {
    index: function() {
      var snd1 = new Audio("/sfx/torch.ogg"), snd2 = new Audio("/sfx/torch.ogg");
      this.snd1 = snd1;
      this.snd2 = snd2;
      snd1.addEventListener('timeupdate', function() {
        if (this.currentTime > 20) {
          this.currentTime = 0;
          this.pause();
          snd2.play();
        }
      }, false);
      snd2.addEventListener('timeupdate', function() {
        if (this.currentTime > 20) {
          this.currentTime = 0;
          this.pause();
          snd1.play();
        }
      }, false);
      
      snd1.volume = 0.0;
      snd2.volume = 0.0;
      
      snd1.play();
      
      
      // this.player.bsp = new BSP();
      // Mesh used for testing player collision vs wall. Sphere/cube tests aren't
      // yet implemented so we have to use a collision mesh.
      // this.player.bsp.addMesh(new Jax.Mesh.Sphere({radius:0.25,slices:4,stacks:4}));
      
      material = Jax.Material.find("rock");
      this.movement = { left: 0, right: 0, forward: 0, backward: 0 };
      
      this.dungeon = new Dungeon();
      this.dungeon.bsp = new BSP();
      this.dungeon.bsp.addMesh(this.dungeon.mesh);
      var torch = this.world.addObject(BlenderModel.find("torch"));
      torch.camera.setPosition([0,0,-5]);

      this.dungeon.mesh.material = material;
      this.dungeon.orientPlayer(this.player);
      
      this.world.addObject(this.dungeon);
      this.dungeon.addTorches("torch", this.world);
      
      this.dungeon.bsp.finalize();
      // this.player.bsp.finalize();
      
      // use a different light from 'torch' simply so we can tweak it separately from the wall torches.
      this.world.addLightSource(window.lantern = LightSource.find("lantern"));
    },

    update: function(timechange) {
      var speed = 1.5;
      
      // HACK - TODO camera should be able to return where it will be moving to, without applying the changes
      var previousPosition = this.player.camera.getPosition();
      this.player.camera.move((this.movement.forward+this.movement.backward)*timechange*speed);
      this.player.camera.strafe((this.movement.left+this.movement.right)*timechange*speed);
      var pos = this.player.camera.getPosition();
      this.player.camera.setPosition(previousPosition);
      
      // keep the player from being able to fly
      pos[1] = 0.3;
      
      var torchDistance = null, buf = vec3.create();
      for (var i = 0; i < this.dungeon.torches.length; i++) {
        var dist = vec3.length(vec3.subtract(this.dungeon.torches[i].camera.getPosition(), pos, buf));
        if (torchDistance == null || dist < torchDistance)
          torchDistance = dist;
      }
      if (torchDistance != null) {
        var maxDistance = 0.65;
        var volume = maxDistance / torchDistance;
        if (volume > 1) volume = 1;
        this.snd1.volume = volume;
        this.snd2.volume = volume;
      }
      
      // check player collision vs dungeon walls; don't move unless it's clear
      var collision;
      // intersect ray with plane -- TODO add to Jax core
      function intersectRayPlane(origin, direction, pOrigin, pNormal) {
        var d = -vec3.dot(pNormal, pOrigin);
        var numer = vec3.dot(pNormal, origin) + d;
        var denom = vec3.dot(pNormal, direction);

        if (denom == 0)  // normal is orthogonal to vector, can't intersect
         return (-1.0);
        return -(numer / denom);
      }

      var self = this;
      var xform = self.player.camera.getTransformationMatrix();
      var newpos;
      function move() {
        if (collision = self.dungeon.bsp.collideSphere(pos, 0.35)) {
          // calculate sliding plane so user can slide along wall
          var spOrigin = collision.collisionPoint;
          var spNormal = vec3.normalize(vec3.subtract(pos, spOrigin, vec3.create()));
          var l = intersectRayPlane(pos, spNormal, spOrigin, spNormal);
          
          newpos = vec3.create();
          vec3.scale(spNormal, collision.penetration + (Math.EPSILON*2), pos);
          vec3.add(spOrigin, pos, pos);
          
          newpos[0] = pos[0] - l * spNormal[0];
          newpos[1] = pos[1] - l * spNormal[1];
          newpos[2] = pos[2] - l * spNormal[2];
          
          pos = newpos;
          pos[1] = 0.3;
          return move();
        }
        return pos;
      }
      self.player.camera.setPosition(move());
      
      if (window.lantern)
        window.lantern.camera.setPosition(vec3.add(this.player.camera.getPosition(), vec3.scale(this.player.camera.getViewVector(), 0.1)));
    },
    
    // Some special actions are fired whenever the corresponding input is
    // received from the user.
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
  });
})();
