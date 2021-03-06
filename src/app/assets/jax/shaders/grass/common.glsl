shared uniform mat4 ivMatrix, mvMatrix, pMatrix, vMatrix;
shared uniform mat3 vnMatrix, nMatrix;

shared uniform vec4 materialDiffuse, materialAmbient, materialSpecular;
shared uniform float materialShininess;

shared uniform int PASS_TYPE;

shared varying vec2 vTexCoords;
shared varying vec3 vNormal, vSurfacePos;
shared varying vec4 vBaseColor;

varying float vColorVariance;

//shared uniform mat4 imvMatrix;
