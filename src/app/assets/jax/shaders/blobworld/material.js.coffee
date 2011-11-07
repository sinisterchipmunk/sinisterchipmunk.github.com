Jax.Material['Blobworld'] = Jax.Class.create Jax.Material,
  initialize: ($super, options) ->
    options = Jax.Util.normalizeOptions options,
      # You can specify default options (see +manifest.yml+) here.
      shader: "blobworld"
    
    $super options
  
  setVariables: (context, mesh, options, vars) ->
    Jax.noise.bind context, vars

    vars.set
      mvMatrix: context.getModelViewMatrix()
      nMatrix: context.getNormalMatrix()
      pMatrix: context.getProjectionMatrix()
      TIME: Jax.uptime
      VERTEX_POSITION: mesh.getVertexBuffer()
      VERTEX_COLOR: mesh.getColorBuffer()
      VERTEX_NORMAL: mesh.getNormalBuffer()
      VERTEX_TEXCOORDS: mesh.getTextureCoordsBuffer()
