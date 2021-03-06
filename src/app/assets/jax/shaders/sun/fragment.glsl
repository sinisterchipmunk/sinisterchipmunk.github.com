//= require "shaders/functions/noise"

uniform float TIME;

void main(inout vec4 ambient, inout vec4 diffuse, inout vec4 specular) {
  float n = abs(snoise(vec4(vPos*1.0, TIME*0.25)) - 0.5) + 
            abs(snoise(vec4(vPos*2.0, TIME*0.25)) - 0.25) + 
            abs(snoise(vec4(vPos*4.0, TIME*0.25)) - 0.125) + 
            abs(snoise(vec4(vPos*8.0, TIME*0.25)) - 0.0625) + 
            abs(snoise(vec4(vPos*16.0, TIME*0.25)) - 0.03125);
            
  diffuse *= n;
  ambient *= n;
}
