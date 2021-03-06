//= require "shaders/functions/noise"

const float NoiseScale = 1.5;

void main(inout vec4 ambient, inout vec4 diffuse, inout vec4 specular) {
  float n = snoise(vPos * 16.0 * NoiseScale) * 0.75;//  n / 16.0 * 12.0;
  float intensity = min(1.0, (n * 0.5 + 0.5));
  ambient.rgb *= intensity;
  diffuse.rgb *= intensity;
}
