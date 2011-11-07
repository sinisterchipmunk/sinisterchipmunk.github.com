// Shared variables save on graphics memory and allow you to "piggy-back" off of
// variables defined in other shaders:

shared uniform mat3 nMatrix;
shared uniform mat4 mvMatrix, pMatrix;

shared varying vec2 vTexCoords;
shared varying vec3 vNormal;
shared varying vec4 vBaseColor;

varying vec4 hatchWeight1;	// weight for pure white (w), and hatch tecture unit 0, 1, 2
varying vec4 hatchWeight2;  // weight for pure black (w), and hatch texture unit 3, 4, 5
varying vec2 texCoord;

uniform sampler2D hatch0;
uniform sampler2D hatch1;
uniform sampler2D hatch2;
uniform sampler2D hatch3;
uniform sampler2D hatch4;
uniform sampler2D hatch5;

uniform float scaleU, scaleV;
