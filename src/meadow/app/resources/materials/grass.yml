# ambient component multiplied with the light source's ambient component
ambient:
  # red: 0.25
  # green: 0.25
  # blue: 0.0
  red: 0.11764705882352941
  green: 0.19215686274509805
  blue: 0.08235294117647059
  alpha: 1.0

# diffuse component multiplied with the light source's diffuse component
diffuse:
  red:   1.0
  green: 1.0
  blue:  1.0
  alpha: 1.0

# specular component multiplied with the light source's specular component
specular:
  red:   1.0
  green: 1.0
  blue:  1.0
  alpha: 0.0

shininess: 30

layers:
  # - type: Texture
  #   path: /images/wheat.png
  #   flip_y: true
  #   scale_x: 1.0
  #   scale_y: 1.0
  #   generate_mipmap: true
  #   min_filter: GL_LINEAR
  #   mag_filter: GL_LINEAR
  #   mipmap_hint: GL_DONT_CARE
  #   format: GL_RGBA
  #   data_type: GL_UNSIGNED_BYTE
  #   wrap_s: GL_CLAMP_TO_EDGE
  #   wrap_t: GL_CLAMP_TO_EDGE
  #   premultiply_alpha: false
  #   colorspace_conversion: true
    
  - type: Grass
  
  # VERY IMPORTANT - lighting must be done AFTER grass/alpha discard calculations
  - type: Lighting
