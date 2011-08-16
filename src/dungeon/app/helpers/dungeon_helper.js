var DungeonHelper = Jax.Helper.create({
  setupPlayer: function(options) {
    this.player.radius = options.radius || 0.35;
    this.bsp = new BSP();
    this.movement = { left: 0, right: 0, forward: 0, backward: 0 };
    
    // use a different light from 'torch' simply so we can tweak it separately from the wall torches.
    if (options.lantern)
      this.world.addLightSource(window.lantern = LightSource.find("lantern"));
  },
  
  movePlayer: function(timechange, lockVertical) {
    var speed = 1.5;
    
    // HACK - TODO camera should be able to return where it will be moving to, without applying the changes
    var forward = this.movement.forward + this.movement.backward;
    var horiz = this.movement.left + this.movement.right;
    var pos;
    if (forward || horiz || this.gravity) {
      var previousPosition = this.player.camera.getPosition();
      this.player.camera.move(forward*timechange*speed);
      this.player.camera.strafe(horiz*timechange*speed);
      pos = this.player.camera.getPosition();
      if (this.gravity) {
        var tmp = this._tmp = this._tmp || vec3.create();
        vec3.scale(this.gravity, timechange, tmp);
        vec3.add(pos, tmp, pos);
      }
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
        var bsp = self.bsp;
        if (collision = bsp.collideSphere(pos, self.player.radius)) {
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
      if (lockVertical) pos[1] = 0.3; // keep the player from being able to fly
      self.player.camera.setPosition(pos);
    }
    else pos = this.player.camera.getPosition();

    if (window.lantern)
      window.lantern.camera.setPosition(vec3.add(this.player.camera.getPosition(), vec3.scale(this.player.camera.getViewVector(), 0.1)));
      
    return pos;
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
});
