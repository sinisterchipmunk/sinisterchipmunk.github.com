Jax.Material['Blob'] = Jax.Class.create Material,
  initialize: ($super, options) ->
    @u = @v = 0
    options = Jax.Util.normalizeOptions options,
      shader: "blob"
    
    $super options
    
  setVariables: (context, mesh, options, vars) ->
    Jax.noise.bind context, vars
    
    vars.set
      mvMatrix: context.getModelViewMatrix()
      nMatrix:  context.getNormalMatrix()
      pMatrix:  context.getProjectionMatrix()
      time:     Jax.uptime
      VERTEX_POSITION: mesh.getVertexBuffer()
