shared attribute vec4 VERTEX_POSITION, VERTEX_COLOR;
shared attribute vec3 VERTEX_NORMAL;
shared attribute vec2 VERTEX_TEXCOORDS;

void main(void) {
  vPos = VERTEX_POSITION.xyz / 10.0;
  gl_Position = pMatrix * mvMatrix * VERTEX_POSITION;
  
  vTexCoords = VERTEX_TEXCOORDS;
  
//  vNormal = VERTEX_NORMAL;
//  vColor = VERTEX_COLOR;
}
