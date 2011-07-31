//= require "application_controller"
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
      
      // use a different light from 'torch' simply so we can tweak it separately from the wall torches.
      this.world.addLightSource(window.lantern = LightSource.find("lantern"));
    },

    update: function(timechange) {
      var speed = 1.5;
      
      var previousPosition = this.player.camera.getPosition();
      this.player.camera.move((this.movement.forward+this.movement.backward)*timechange*speed);
      this.player.camera.strafe((this.movement.left+this.movement.right)*timechange*speed);
      
      var newpos = this.player.camera.getPosition();

      this.player.camera.setPosition(this.dungeon.walk(previousPosition, newpos));
      
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
