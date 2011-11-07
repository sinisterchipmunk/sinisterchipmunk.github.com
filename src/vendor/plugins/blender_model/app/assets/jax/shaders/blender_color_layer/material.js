Jax.Material.BlenderColorLayer = Jax.Class.create(Jax.Material, {
  initialize: function($super, options) {
    options = Jax.Util.normalizeOptions(options, {
      shader: "blender_color_layer"
    });
    if (!options.dataBuffer) throw new Error("Data buffer is required");
    $super(options);
  },
  
  setAttributes: function($super, context, mesh, options, attributes) {
    attributes.set('COLOR', this.dataBuffer);
  }
});
