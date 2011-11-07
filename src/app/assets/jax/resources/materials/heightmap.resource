# ambient component multiplied with the light source's ambient component
ambient:
  red:   1.0
  green: 0.6
  blue:  0.0
  alpha: 1.0

# diffuse component multiplied with the light source's diffuse component
diffuse:
  red:   1.0
  green: 0.6
  blue:  0.0
  alpha: 1.0

# specular component multiplied with the light source's specular component
specular:
  red:   1.0
  green: 1.0
  blue:  1.0
  alpha: 1.0

shininess: 30

layers:
  # remove Lighting to conserve video memory if you don't need/want support for light sources
  - type: Lighting
  
  - type: Texture
    path: /images/dirt.png
    flip_y: false
    scale_x: 4.0
    scale_y: 4.0
    generate_mipmap: true
    min_filter: GL_LINEAR
    mag_filter: GL_LINEAR
    mipmap_hint: GL_DONT_CARE
    format: GL_RGBA
    data_type: GL_UNSIGNED_BYTE
    wrap_s: GL_REPEAT
    wrap_t: GL_REPEAT
    premultiply_alpha: false
    colorspace_conversion: true

  - type: Heightmap

