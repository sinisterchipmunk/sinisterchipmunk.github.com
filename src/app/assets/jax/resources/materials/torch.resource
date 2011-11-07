# ambient component multiplied with the light source's ambient component
ambient:
  red:   0.5
  green: 0.5
  blue:  0.5
  alpha: 1.0

# diffuse component multiplied with the light source's diffuse component
diffuse:
  red:   0.5
  green: 0.5
  blue:  0.5
  alpha: 1.0

# specular component multiplied with the light source's specular component
specular:
  red:   0.5
  green: 0.5
  blue:  0.5
  alpha: 1.0

shininess: 30

layers:
  # remove Lighting to conserve video memory if you don't need/want support for light sources
  - type: Lighting
