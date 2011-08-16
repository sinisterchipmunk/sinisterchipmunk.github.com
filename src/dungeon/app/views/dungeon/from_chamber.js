Jax.views.push('dungeon/from_chamber', function() {
  this.glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  this.world.render();
  this.context.current_controller.dungeon.torchfire.render(this.context);
});
