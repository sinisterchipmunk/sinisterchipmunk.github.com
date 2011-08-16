//= require "application_controller"
var DungeonController = (function() {
var material;
  return Jax.Controller.create("dungeon", ApplicationController, {
    index: function() {
      this.setupPlayer({lantern:true});
      
      var snd = this.snd = new Audio("/sfx/torch.ogg");
      snd.addEventListener('ended', function() {
        this.currentTime = 0;
      }, false);
      snd.play();
      snd.volume = 0.0;
      
      // set up dungeon
      var self = this;
      window.dungeon = this.dungeon = window.dungeon || (function() {
        var dungeon = new Dungeon();
        dungeon.mesh.material = "rock";
        return dungeon;
      })();
      this.dungeon.orientPlayer(self.player);
      this.dungeon.addTorches("torch", self.world);
      this.world.addObject(this.dungeon);
      
      // set up collision mesh
      this.bsp.addMesh(this.dungeon.mesh);
      this.bsp.finalize();
      
      this.door = this.world.addObject(new Jax.Model({
        mesh: new Jax.Mesh.Quad({
          width:0.5,
          height: 1.2,
          material: "wood"
        }),
        
        position: [20, 0, 4.49],
        
        direction: [0,0,0]
      }));
      
      // this.player.camera.reorient([0,0,-1], [20,0.3,3]);
    },
    
    // called by chamber, when player clicks door to exit
    from_chamber: function() {
      // do everything in index, but reposition camera next to door
      this.index();
      
      // HACKS context should do this for us and rotation shouldn't need to 
      // be set after reset
      this.player.camera.reset();
      this.player.camera.rotation = quat4.create([0,0,0,1]);
      
      this.player.camera.reorient([0,0,-1], [20,0.3,4]);
    },
    
    mouse_moved: function(event) {
      var obj;
      this.door.mesh.highlight = false;
      if (obj = this.world.pick(event.x, event.y))
        obj.mesh.highlight = true;
    },
    
    mouse_clicked: function(event) {
      if (this.door.mesh.highlight) {
        if (this.snd) {
          this.snd.pause();
          this.snd = null;
        }
        this.context.redirectTo("chamber");
      }
    },

    update: function(timechange) {
      var pos = this.movePlayer(timechange, true);
      
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
    },
    
    helpers: [DungeonHelper]
  });
})();
