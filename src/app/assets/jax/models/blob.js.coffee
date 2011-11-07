Jax.getGlobal()['Blob'] = Jax.Model.create
  update: (tc) ->
    @axis or= [1,0,0]
    @camera.rotate tc, @axis

  after_initialize: ->
    u = 2*Math.PI/16
    v = Math.PI/16
   
    @mesh = new Jax.Mesh
      material: "blob"
      
      init: (vertices, colors, textureCoords, normals, indices) ->
        for x in [0...64]
          for y in [0...64]
            u = x
            v = y
            vertices.push u  , v  , 0,
                          u+1, v  , 0,
                          u  , v+1, 0
            vertices.push u  , v+1, 0,
                          u+1, v  , 0,
                          u+1, v+1, 0
    
    @mesh.material.u = u;
    @mesh.material.v = v;
