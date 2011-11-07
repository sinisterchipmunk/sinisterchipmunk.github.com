vec3 findRealPosition(vec3 p) {

  // can't use the Y component because it will skew
  // the results per-vertex (e.g. top of grass won't be top any more)
  
  float height = snoise(p.xz / 5.0) * 0.35;
  return vec3(p.x, p.y + height, p.z);
}
