Jax.views.push "Dungeon/index", ->
  @glClear GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT
  @world.render()
  @context.current_controller.dungeon.torchfire.render @context
