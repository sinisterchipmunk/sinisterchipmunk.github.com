vec3.min = function(a, b, dest) {
  if (!dest) dest = vec3.create();
  
  dest[0] = Math.min(a[0], b[0]);
  dest[1] = Math.min(a[1], b[1]);
  dest[2] = Math.min(a[2], b[2]);
  
  return dest;
}

vec3.max = function(a, b, dest) {
  if (!dest) dest = vec3.create();
  
  dest[0] = Math.max(a[0], b[0]);
  dest[1] = Math.max(a[1], b[1]);
  dest[2] = Math.max(a[2], b[2]);
  
  return dest;
}
