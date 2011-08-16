shared attribute vec4 TEXTURE_COORDS;

void main(void) {
  vec4 vertex = vec4(TEXTURE_COORDS.xy, 0, 1);
  vTexCoords = TEXTURE_COORDS.xy;
  
  float texXY = (vTexCoords.y + vTexCoords.x);
    
  float ttime = clamp(time, 0.0, <%= Math.PI * 2 %>);
  
  float m = time * 0.25;
  if (m > 0.5) m = 0.5;
  
  vertex.x = m * cos(6.0 * (ttime - texXY));
  vertex.z = m * sin(6.0 * (ttime - texXY));
  vertex.y = clamp(time / 2.0, 0.0, 1.0) * vTexCoords.y;
  
  if (ttime >= <%= Math.PI %>) {
    // cyclone is completely expanded, now we need to get back to the
    // original shape
    float timeOffset = <%= Math.PI %> + texXY;
    if (time > timeOffset) {
      float speed = 1.0;
      
      vec3 dest = vec3(vTexCoords.x - 0.5, vTexCoords.y, 0);
      float timechange = (time) - timeOffset;
      float amount = clamp(timechange * speed, 0.0, 1.0);
      vertex.xyz += (dest - vertex.xyz) * amount;
    }
  }
  
  // add waves
  float waveWidth = 3.0, waveHeight = 1.0;
  float x = vertex.x;
  float y = vertex.y;
  float freq = time * 2.0;
  float z = sin(waveWidth * x + freq) * cos(waveWidth * x + freq) * waveHeight +
            sin(waveWidth * y + freq) * cos(waveWidth * y + freq) * waveHeight;
  vertex.z += z * 0.125;
  
  vertex.xyz *= scale;
  
  float offset = time / 2.0;
  if (offset > 0.5) offset = 0.5;
  vertex.y += offset;
  
  gl_PointSize = 2.0;
  gl_Position = pMatrix * mvMatrix * vertex;
}
