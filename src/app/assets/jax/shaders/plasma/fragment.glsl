//= require "shaders/functions/noise"

uniform float TIME;

vec3 VeinColor = vec3(0.6,0.6,1.0);

void main(inout vec4 ambient, inout vec4 diffuse, inout vec4 specular) {
  float n = abs(snoise(vec4(vPos/4.0, TIME)) - 0.25) + 
                 abs(snoise(vec4(vPos/2.0, TIME)) - 0.125) + 
                 abs(snoise(vec4(vPos, TIME)) - 0.0625) + 
                 abs(snoise(vec4(vPos*2.0, TIME)) - 0.03125);
                 
  float sineval = sin(vPos.y + n) * 0.5 + 0.5;
  
  ambient.rgb = mix(VeinColor, ambient.rgb, sineval) * 2.0;
  // not illuminated by lights... the ambient component is its own
  diffuse = specular = vec4(0);
}
