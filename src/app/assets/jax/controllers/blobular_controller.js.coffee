Jax.Controller.create "Blobular", ApplicationController,
  index: ->
    model = new Blob
    @world.addObject model
    @player.camera.move -5
    
    @skybox = @world.addObject new Jax.Model mesh: new Jax.Mesh.Sphere
      radius:25
      material: "blobworld"

    @red   = LightSource.find "blob_red"
    @green = LightSource.find "blob_green"
    @blue  = LightSource.find "blob_blue"

    @world.addLightSource @red
    @world.addLightSource @green
    @world.addLightSource @blue
      
  update: (tc) ->
    @rot = (@rot || 0) + tc * 3.0

    set = (light, angle) =>
      s = Math.sin angle
      c = Math.cos angle
      light.camera.setPosition s*20, c*20, 20
    
    dif = Math.deg2rad 120
    set @red,   @rot + dif
    set @blue,  @rot + dif*2
    set @green, @rot + dif*3

    @skybox.camera.rotate tc / 8.0, [1,1,0.5]
