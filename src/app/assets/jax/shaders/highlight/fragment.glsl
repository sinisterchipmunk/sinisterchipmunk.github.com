/*
  ambient, diffuse and specular represent the cumulative color to be eventually
  written to +gl_FragColor+. You should output your colors into these vectors.
*/
uniform bool highlight;

void main(inout vec4 ambient, inout vec4 diffuse, inout vec4 specular) {
  if (highlight) {
    ambient.rgb *= 1.5;
    diffuse.rgb *= 1.5;
    specular.rgb *= 1.5;
  }
}
