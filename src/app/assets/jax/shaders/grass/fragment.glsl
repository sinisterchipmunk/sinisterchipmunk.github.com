//= require "shaders/functions/noise"

vec3 minGrass = vec3(0, 0, 0);
vec3 maxGrass = vec3(0.396078431372549, 0.5137254901960784, 0.30196078431372547);
vec3 variance = vec3(0.11764705882352941, 0.19215686274509805, 0.08235294117647059);

void main(inout vec4 ambient, inout vec4 diffuse, inout vec4 specular) {
  ambient *= materialAmbient * vBaseColor;
  diffuse *= materialDiffuse * vBaseColor;
  specular *= materialSpecular * vBaseColor;
  
  specular = vec4(0,0,0,0);

  // parabola
  if ((1.0 - vTexCoords.y) < 4.0*pow(vTexCoords.x-0.5, 2.0))
    discard;
  
  if (diffuse.a <= 0.8)
    discard;
  
  diffuse = vec4(mix(variance, maxGrass, vColorVariance), 1.0);
  diffuse = vec4(mix(minGrass, diffuse.rgb, vTexCoords.y), 1.0);
  
  // makes each blade of grass just slightly darker in the center than at the edge
  ambient = mix(vec4(0,0,0,1), ambient*2.0, abs(vTexCoords.x-0.5)*2.0);
}
