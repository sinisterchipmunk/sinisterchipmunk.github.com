//= require "application_controller"
var DungeonController = (function() {
var material;
  return Jax.Controller.create("dungeon", ApplicationController, {
    index: function() {
      var snd = this.snd = new Audio("/sfx/torch.ogg");
      snd.addEventListener('ended', function() {
        this.currentTime = 0;
      }, false);
      snd.play();
      snd.volume = 0.0;
      
      material = Jax.Material.find("rock");
      this.movement = { left: 0, right: 0, forward: 0, backward: 0 };
      
      // set up dungeon
      this.dungeon = new Dungeon();
      this.dungeon.mesh.material = material;
      this.dungeon.orientPlayer(this.player);
      this.world.addObject(this.dungeon);
      this.dungeon.addTorches("torch", this.world);
      
      // set up dungeon's collision mesh
      this.dungeon.bsp = new BSP();
      this.dungeon.bsp.addMesh(this.dungeon.mesh);
      this.dungeon.bsp.finalize();

      // use a different light from 'torch' simply so we can tweak it separately from the wall torches.
      this.world.addLightSource(window.lantern = LightSource.find("lantern"));
    },

    update: function(timechange) {
      var speed = 1.5;
      
      // HACK - TODO camera should be able to return where it will be moving to, without applying the changes
      var forward = this.movement.forward + this.movement.backward;
      var horiz = this.movement.left + this.movement.right;
      var pos;
      if (forward || horiz) {
        var previousPosition = this.player.camera.getPosition();
        this.player.camera.move(forward*timechange*speed);
        this.player.camera.strafe(horiz*timechange*speed);
        pos = this.player.camera.getPosition();
        this.player.camera.setPosition(previousPosition);

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
        var spNormal = this.spNormal = this.spNormal || vec3.create();
        var spOrigin;
        function move() {
          if (collision = self.dungeon.bsp.collideSphere(pos, 0.35)) {
            // calculate sliding plane so user can slide along wall
            spOrigin = collision.collisionPoint;
            vec3.normalize(vec3.subtract(pos, spOrigin, spNormal));
            var l = intersectRayPlane(pos, spNormal, spOrigin, spNormal);

            vec3.scale(spNormal, collision.penetration + (Math.EPSILON*2), pos);
            vec3.add(spOrigin, pos, pos);

            pos[0] = pos[0] - l * spNormal[0];
            pos[1] = pos[1] - l * spNormal[1];
            pos[2] = pos[2] - l * spNormal[2];

            return move();
          }
          return pos;
        }
        move();
        pos[1] = 0.3; // keep the player from being able to fly
        self.player.camera.setPosition(pos);
      }
      else pos = this.player.camera.getPosition();

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
        this.snd.volume = volume;
      }
      
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
