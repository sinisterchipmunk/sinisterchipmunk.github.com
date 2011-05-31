var NoisyHelper = Jax.Helper.create({
  setupNoise: function(context, mesh, options, uniforms) {
    this.noise = this.noise || new Jax.Noise(context);
    uniforms.texture('permTexture', this.noise.perm, context);
    uniforms.texture('gradTexture', this.noise.grad, context);
    uniforms.texture('simplexTexture', this.noise.simplex, context);
    uniforms.set('TIME', Jax.uptime);
  }
});