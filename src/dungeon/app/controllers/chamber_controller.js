//= require "application_controller"

var ChamberController = (function() {
  return Jax.Controller.create("chamber", ApplicationController, {
    index: function() {
      this.setupPlayer({lantern:true});

      var self = this;
      var chamber = BlenderModel.find("chamber");
      var casket = BlenderModel.find("casket");
      var casket_lid = this.casket_lid = BlenderModel.find("casket-lid");
      var door = this.door = new Jax.Model({
        mesh: new Jax.Mesh.Quad({
          width:0.5,
          height: 1.2,
          material: "wood"
        }),
        
        position: [-2.15, 0, 1.75],
        
        direction: [1,0,0]
      });
      
      casket_lid.allow_highlighting = true;
      
      casket.onload = chamber.onload = function(mesh) {
        self.bsp.addMesh(mesh);
        self.bsp.finalize();
      };
      
      this.world.addObject(chamber);
      this.world.addObject(casket);
      this.world.addObject(casket_lid);
      this.world.addObject(door);
      this.blue_light = LightSource.find("blue_light");
      this.blue_light.attenuation.direction = -1;
      this.world.addLightSource(this.blue_light);
      
      this.particles = new LogoParticles({resolution:0.7,position:[0,-0.25,0],direction:[1,0,0]});
      //0.4375

      this.player.camera.setPosition([-1.8,0.35,1.8]);
      this.player.camera.lookAt([0,0,0]);
      
      this.doPicking = true;
    },
    
    update: function(tc) {
      var pos = this.movePlayer(tc, true);
      
      // TODO everything below this point should be moved to a model.
      
      // make the blue light appear to pulse
      var atten;
      this.pulseSpeed = this.pulseSpeed || 1;
      this.blue_light.attenuation.linear += tc * this.pulseSpeed * this.blue_light.attenuation.direction;
      if (this.blue_light.attenuation.linear <= this.blue_light.min_atten) {
        this.blue_light.attenuation.direction = 1;
        this.blue_light.attenuation.linear = this.blue_light.min_atten;
      }
      else if (this.blue_light.attenuation.linear >= this.blue_light.max_atten) {
        this.blue_light.attenuation.direction = -1;
        this.blue_light.attenuation.linear = this.blue_light.max_atten;
      }
        
      // blue light attenuation tracker, e.g. it gets brighter after casket is opened
      if (this.blue_light.attenuating == 1 || this.blue_light.attenuating == 2) {
        var attenSpeed = 1;
        var newMaxAtten = 0.75, newMinAtten = 0.5;
        if (this.blue_light.attenuating == 1) { // init pass, to set up attenuation speed
          this.pulseSpeed = (newMaxAtten - newMinAtten) / (this.blue_light.max_atten - this.blue_light.min_atten);
          this.blue_light.maxAttenSpeed     = (this.blue_light.max_atten - newMaxAtten) / attenSpeed;
          this.blue_light.minAttenSpeed     = (this.blue_light.min_atten - newMinAtten) / attenSpeed;
          this.blue_light.attenuating = 2;
        } else {
          this.blue_light.max_atten += this.blue_light.maxAttenSpeed * tc;
          this.blue_light.min_atten += this.blue_light.minAttenSpeed * tc;
          var done = 0;
          if ((this.blue_light.maxAttenSpeed > 0 && this.blue_light.max_atten >= newMaxAtten) ||
              (this.blue_light.maxAttenSpeed < 0 && this.blue_light.max_atten <= newMaxAtten) ||
               this.blue_light.maxAttenSpeed == 0) {
            done++;
            this.blue_light.max_atten = newMaxAtten;
          }
          if ((this.blue_light.minAttenSpeed > 0 && this.blue_light.min_atten >= newMinAtten) ||
              (this.blue_light.minAttenSpeed < 0 && this.blue_light.min_atten <= newMinAtten) ||
               this.blue_light.minAttenSpeed == 0) {
            done++;
            this.blue_light.min_atten = newMinAtten;
          }
          // kill condition, to save cpu cycles
          if (done == 2) this.blue_light.attenuating = 3;
        }
      }
      
      // blue light movement tracker
      var lightSpeed = 1;
      var movement;
      if (this.blue_light.moving == 1) {
        movement = tc * lightSpeed;
        this.blue_light.camera.move(movement, [0,1,0]);
        if (this.blue_light.camera.getPosition()[1] >= 0.5) {
          this.blue_light.camera.setPosition([0,0.5,0]);
          this.blue_light.moving = 2;
        }
      }
      
      // casket movement tracker
      // physics engine isn't implemented yet so this will have to do
      var casketSpeed = 1;
      if (this.casket_lid.moving == 1) { // moving
        movement =  tc * casketSpeed;
        this.casket_lid.tracker = (this.casket_lid.tracker || 0) + movement;
        if (this.casket_lid.tracker >= 0.25) {
          this.casket_lid.moving = 2;
          this.casket_lid.tracker = 0;
          this.casket_lid.camera.setPosition([0.25, 0, 0]);
        } else {
          this.casket_lid.camera.move(movement, [1, 0, 0]);
        }
      } else if (this.casket_lid.moving == 2) { // pivoting
        if (this.casket_lid.tracker <= Math.PI/3) {
          var rotation = tc * casketSpeed;
          this.casket_lid.tracker += rotation;
          this.casket_lid.camera.roll(rotation);
        } else {
          quat4.fromAngleAxis(Math.PI/3, this.casket_lid.camera.getViewVector(), this.casket_lid.camera.rotation);
          this.casket_lid.moving = 3;
          this.casket_lid.tracker = 0;
        }
      } else if (this.casket_lid.moving == 3) { // falling
        movement =  tc * casketSpeed;
        this.casket_lid.tracker += movement;
        this.casket_lid.camera.move(movement, [0.4,-1,0]);
        if (this.casket_lid.camera.getPosition()[1] <= -0.25) {
          this.casket_lid.camera.setPosition([0.357,-0.25,0]);
          this.casket_lid.moving = 4;
          this.casket_lid.allow_highlighting = false;
          this.blue_light.moving = 1;
          this.blue_light.attenuating = 1;
          this.particles.start();
          this.world.addObject(this.particles);
        }
      }
    },
    
    mouse_moved: function(event) {
      this.pick(event);
    },
    
    mouse_clicked: function(event) {
      if (this.casket_lid.mesh.highlight) {
        this.casket_lid.moving = 1;
        this.casket_lid.mesh.highlight = false;
      }
      
      /*
      // Weird bug is killing the update rate after second visit to dungeon; disabling for now
      // until I figure out what's up
      
      if (this.door.mesh.highlight) {
        this.world.dispose();
        this.world = this.context.world = new Jax.World(this.context);
        this.context.redirectTo("dungeon/from_chamber");
      }
      */
    },
    
    pick: function(mouse) {
      // HACK FIXME TODO see jax.js line 7200, RESOLVE IN JAX before deploying or dungeon will break
      this.casket_lid.mesh.highlight = false;
      this.door.mesh.highlight = false;
      
      if (this.doPicking && mouse && mouse.x != undefined && mouse.y != undefined) {
        var obj;
        if (obj = this.world.pick(mouse.x, mouse.y)) {
          if (obj != this.casket_lid || this.casket_lid.allow_highlighting) {
            obj.mesh.highlight = true;
          }
        }
      }
    },
    
    helpers: [DungeonHelper]
  });
})();
