uniform float scaleU, scaleV;

vec2 texCoord;
vec3 hatchWeight1,  // weight for pure white (w), and hatch tecture unit 0, 1, 2
     hatchWeight2;  // weight for pure black (w), and hatch texture unit 3, 4, 5


void calcHatchWeights(in float hatchLevel) {
  if (hatchLevel >= 6.0)
  {
  	hatchWeight1.x = 1.0;
  }
  else if (hatchLevel >= 4.0)
  {
  	hatchWeight1.x = 1.0 - (5.0 - hatchLevel);
  	hatchWeight1.y = 1.0 - hatchWeight1.x;
  }
  else if (hatchLevel >= 3.0)
  {
  	hatchWeight1.y = 1.0 - (4.0 - hatchLevel);
  	hatchWeight1.z = 1.0 - hatchWeight1.y;
  }
  else if (hatchLevel >= 2.0)
  {
  	hatchWeight1.z = 1.0 - (3.0 - hatchLevel);
  	hatchWeight2.x = 1.0 - hatchWeight1.z;
  }
  else if (hatchLevel >= 1.0)
  {
  	hatchWeight2.x = 1.0 - (2.0 - hatchLevel);
  	hatchWeight2.y = 1.0 - hatchWeight2.x;
  }
  else
  {
  	hatchWeight2.y = 1.0 - (1.0 - hatchLevel);
  	hatchWeight2.z = 1.0 - hatchWeight1.y;
  }
}

void accumHatchColor(out vec4 color) {
  color  =	texture2D(hatch0, texCoord) * hatchWeight1.x;
  color +=	texture2D(hatch1, texCoord) * hatchWeight1.y;
  color +=	texture2D(hatch2, texCoord) * hatchWeight1.z;
  color +=	texture2D(hatch3, texCoord) * hatchWeight2.x;
  color +=	texture2D(hatch4, texCoord) * hatchWeight2.y;
  color +=	texture2D(hatch5, texCoord) * hatchWeight2.z;
}

void main(inout vec4 ambient, inout vec4 diffuse, inout vec4 specular) {
  texCoord = vec2(vTexCoords.x * scaleU, vTexCoords.y * scaleV * 0.5);
  
  vec4 color = ambient + diffuse;
  float all = color.r + color.g + color.b;
  all = clamp(all, 0.0, 3.0) / 3.0;
  calcHatchWeights(all * 6.0);
  accumHatchColor(color);
  diffuse = color;
  ambient = specular = vec4(0);
}
