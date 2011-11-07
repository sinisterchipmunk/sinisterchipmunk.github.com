//= require "shaders/functions/noise"

uniform float TIME;

vec3 cloudColor = vec3(0.85,0.85,0.85);

void main(inout vec4 ambient, inout vec4 diffuse, inout vec4 specular) {
  ambient = specular = vec4(0);
  
  // gradient the sky color based on Y position.
  // We know the sky sphere has a radius 25, so Y is in range -2.5..2.5 (we divided by 10 in vshader).
  vec3 minSkyColor = vec3(0.2235294117647059, 0.4, 0.7568627450980392),
       maxSkyColor = vec3(0.5058823529411764, 0.6549019607843137, 0.8392156862745098);
  
  diffuse = vec4(mix(minSkyColor, maxSkyColor, abs(vPos.y)/2.5), 1.0);
  
  

  float t = TIME * 0.025;
  float cloudThickness = snoise(vec4(vPos, t)) +
                         0.5 * snoise(vec4(vPos*2.0, t)) +
                         0.25 * snoise(vec4(vPos*4.0, t)) +
                         0.125 * snoise(vec4(vPos*8.0, t)) +
                         0.0625 * snoise(vec4(vPos*16.0, t));
  
  cloudThickness = (cloudThickness+1.0)/2.0;

  diffuse.rgb = mix(diffuse.rgb, cloudColor, cloudThickness);
}
