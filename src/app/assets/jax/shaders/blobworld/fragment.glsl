//= require "shaders/functions/noise"

uniform float TIME;

vec3 cloudColor = vec3(0.05,0.05,0.05);

void main(inout vec4 ambient, inout vec4 diffuse, inout vec4 specular) {
  ambient = specular = vec4(0);
  
  //vec3 minSkyColor = vec3(0.2235294117647059, 0.4, 0.7568627450980392),
//       maxSkyColor = vec3(0.4058823529411764, 0.5549019607843137, 0.8392156862745098);
  
  diffuse.rgb = vec3(0.2, 0.4, 0.75) * 0.45;
  
  

  float t = TIME * 0.25;
  float upper = snoise(vec4(vPos, t)) +
                0.5 * snoise(vec4(vPos*2.0, t)) +
                0.25 * snoise(vec4(vPos*4.0, t));
  float lower = 0.125 * snoise(vec4(vPos*8.0, t)) +
                0.0625 * snoise(vec4(vPos*16.0, t));
                          
  float cloudThickness = upper + lower;
  vec3 color = vec3(0.25, 0, 0) * (upper+1.0) * 0.5 +
               vec3(0, 0.25, 0) * (lower+1.0) * 0.5;
                         
  diffuse.rgb = mix(diffuse.rgb, color, cloudThickness);

/*
  float t = TIME * 0.25;
  float cloudThickness = snoise(vec4(vPos, t)) +
                         0.5 * snoise(vec4(vPos*2.0, t)) +
                         0.25 * snoise(vec4(vPos*4.0, t)) +
                         0.125 * snoise(vec4(vPos*8.0, t)) +
                         0.0625 * snoise(vec4(vPos*16.0, t));
                         
  diffuse.rgb = mix(diffuse.rgb, color, cloudThickness);
  */
}
