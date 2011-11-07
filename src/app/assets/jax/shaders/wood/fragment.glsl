//= require "shaders/functions/noise"

/* if I weren't lazy, these would be uniforms. */
const vec3 LightWood = vec3(0.6, 0.3, 0.1);
const vec3 DarkWood = vec3(0.4, 0.2, 0.07);
const float RingFreq = 4.0;
const float LightGrains = 1.0;
const float DarkGrains = 0.0;
const float GrainThreshold = 0.5;
const vec3 NoiseScale = vec3(0.5, 0.1, 0.1);
const float Noisiness = 3.0;
const float GrainScale = 27.0;

void main(inout vec4 ambient, inout vec4 diffuse, inout vec4 specular) {
  float n = snoise(vPos * NoiseScale) * Noisiness;
  vec3 noisevec = vec3(snoise(vPos * NoiseScale) * Noisiness,
                       snoise(vPos*2.0 * NoiseScale) / 2.0 * Noisiness,
                       snoise(vPos*4.0 * NoiseScale) / 4.0 * Noisiness);
                       
  vec3 location = vPos + noisevec;
  float dist = sqrt(location.x * location.x + location.y * location.y + location.z * location.z);
  dist *= RingFreq;
  
  float r = fract(dist + noisevec.x + noisevec.y + noisevec.z) * 2.0;
  if (r > 1.0) r = 2.0 - r;
  
  vec3 color = mix(LightWood, DarkWood, r);
  r = fract((vPos.x + vPos.z) * GrainScale + 0.5);
  noisevec.z *= r;
  if (r < GrainThreshold)
    color += LightWood * LightGrains * noisevec.z;
  else
    color -= LightWood * DarkGrains * noisevec.z;
    
  ambient.rgb *= color;
  diffuse.rgb *= color;
}
