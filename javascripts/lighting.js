Jax.environment = Jax.PRODUCTION;


Jax.Material.Depthmap = Jax.Class.create(Jax.Material, {
  initialize: function($super) {
    $super({shader:"depthmap"});
  }
});
Jax.LINEAR = 1;
Jax.EXPONENTIAL = 2;
Jax.EXP2 = 3;

Jax.Material.Fog = Jax.Class.create(Jax.Material, {
  initialize: function($super, options) {
    options = Jax.Util.normalizeOptions(options, {
      shader: "fog",
      algorithm: Jax.EXP2,
      start: 10.0,
      end: 100.0,
      density: 0.0015,
      color:[1,1,1,1]
    });
    options.color = Jax.Util.colorize(options.color);
    options.color = [options.color[0],options.color[1],options.color[2],options.color[3]];
    if (typeof(options.algorithm) == "string") {
      var name = options.algorithm;
      options.algorithm = Jax[name];
      if (!options.algorithm) throw new Error("Jax: Fog algorithm must be one of LINEAR, EXPONENTIAL, or EXP2");
    }
    $super(options);
  },

  setUniforms: function($super, context, mesh, options, uniforms) {
    $super(context, mesh, options, uniforms);

    uniforms.set('End', this.end);
    uniforms.set('Scale', 1.0 / (this.end - this.start));
    uniforms.set('Algorithm', this.algorithm);
    uniforms.set('Density', this.density);
    uniforms.set('FogColor', this.color);
  }
});
Jax.Material.Lighting = Jax.Class.create(Jax.Material, {
  initialize: function($super, options) {
    $super(Jax.Util.normalizeOptions(options, {shader: "lighting"}));
  },

  setUniforms: function($super, context, mesh, options, uniforms) {
    $super(context, mesh, options, uniforms);

    var light = context.world.lighting.getLight();
    uniforms.set({
      LIGHTING_ENABLED: context.world.lighting.isEnabled() && !(options.unlit),
      LIGHT_POSITION: light.getPosition(),
      LIGHT_DIRECTION: light.getDirection(),
      LIGHT_AMBIENT: light.getAmbientColor(),
      LIGHT_DIFFUSE: light.getDiffuseColor(),
      LIGHT_SPECULAR: light.getSpecularColor(),
      LIGHT_ATTENUATION_CONSTANT: light.getConstantAttenuation(),
      LIGHT_ATTENUATION_LINEAR: light.getLinearAttenuation(),
      LIGHT_ATTENUATION_QUADRATIC: light.getQuadraticAttenuation(),
      LIGHT_SPOT_EXPONENT: light.getSpotExponent(),
      LIGHT_SPOT_COS_CUTOFF: light.getSpotCosCutoff(),
      LIGHT_ENABLED: light.isEnabled(),
      LIGHT_TYPE: light.getType()
    });
  }
});
Jax.Material.NormalMap = Jax.Class.create(Jax.Material, {
  initialize: function($super, map) {
    this.map = Jax.Material.Texture.normalizeTexture(map);
    $super({shader:"normal_map"});
  },

  setUniforms: function($super, context, mesh, options, uniforms) {
    $super(context, mesh, options, uniforms);
    uniforms.texture('NormalMap', this.map, context);
  },

  setAttributes: function($super, context, mesh, options, attributes) {
    $super(context, mesh, options, attributes);
    attributes.set('VERTEX_TANGENT', mesh.getTangentBuffer());
  }
});
Jax.Material.Paraboloid = Jax.Class.create(Jax.Material, {
  initialize: function($super, options) {
    $super(Jax.Util.normalizeOptions(options, {shader:"paraboloid"}));
  },

  setUniforms: function($super, context, mesh, options, uniforms) {
    $super(context, mesh, options, uniforms);

    uniforms.set({
      DP_SHADOW_NEAR: 0.1, //c.world.lighting.getLight().getDPShadowNear() || 0.1;}},
      DP_SHADOW_FAR:  500,//c.world.lighting.getLight().getDPShadowFar() || 500;}},
      DP_DIRECTION: options && options.direction || 1
    });
  }
});
Jax.Material.Picking = Jax.Class.create(Jax.Material, {
  initialize: function($super) {
    $super({shader:"picking"});
  },

  setUniforms: function($super, context, mesh, options, uniforms) {
    $super(context, mesh, options, uniforms);

    model_index = options.model_index;
    if (model_index == undefined) model_index = -1;

    uniforms.set('INDEX', model_index);
  }
});
Jax.Material.ShadowMap = Jax.Class.create(Jax.Material, {
  initialize: function($super) {
    $super({shader:"shadow_map"});
  },

  setUniforms: function($super, context, mesh, options, uniforms) {
    $super(context, mesh, options, uniforms);

    uniforms.set({
      DP_SHADOW_NEAR: 0.1, //c.world.lighting.getLight().getDPShadowNear() || 0.1;}},
      DP_SHADOW_FAR: 500,//c.world.lighting.getLight().getDPShadowFar() || 500;}},

      SHADOWMAP_PCF_ENABLED: false,
      SHADOWMAP_MATRIX: context.world.lighting.getLight().getShadowMatrix(),
      SHADOWMAP_ENABLED: context.world.lighting.getLight().isShadowMapEnabled()
    });

    var light = context.world.lighting.getLight(), front, back;

    front = light.getShadowMapTextures(context)[0];
    back  = light.getShadowMapTextures(context)[1];

    if (front) uniforms.texture('SHADOWMAP0', front, context);
    if (back)  uniforms.texture('SHADOWMAP1', back,  context);
  }
});
Jax.Material.Texture = Jax.Class.create(Jax.Material, {
  initialize: function($super, texture) {
    this.texture = Jax.Material.Texture.normalizeTexture(texture);
    $super({shader:"texture"});
  },

  setUniforms: function($super, context, mesh, options, uniforms) {
    $super(context, mesh, options, uniforms);
    uniforms.texture('Texture', this.texture, context);
    uniforms.set('TextureScaleX', this.texture.options.scale_x || this.texture.options.scale || 1);
    uniforms.set('TextureScaleY', this.texture.options.scale_y || this.texture.options.scale || 1);
  }
});

Jax.Material.Texture.normalizeTexture = function(tex) {
  if (tex.isKindOf && tex.isKindOf(Jax.Texture)) return tex;
  return new Jax.Texture(tex);
};
var ApplicationHelper = Jax.Helper.create({

});
var MainHelper = Jax.Helper.create({

});
var ApplicationController = (function() {
  return Jax.Controller.create("application", Jax.Controller, {

  });
})();

/*
  Example of blinn-phong shading with arbitrary light sources. Renders a teapot with 3 light sources:
  red, blue and white. The white light source is a spotlight and will pivot back and forth over a 90-degree angle
  with the teapot in the center. The mouse can be moved to move the camera, or dragged to move the teapot.
 */

var MainController = (function() {
  var movement = { forward: 0, backward: 0, left: 0, right: 0 };

  return Jax.Controller.create("main", ApplicationController, {
    index: function() {
      var custom_material = Jax.Material.find("lighting_with_shadows");

      this.world.addObject(new Jax.Model({ mesh: new Jax.Mesh.Teapot({size:10, material:custom_material}),position:[0,0,-25] }));
      this.world.addObject(new Jax.Model({ mesh: new Jax.Mesh.Plane({size:75, material:custom_material}), position:[0,-15,-50],direction:[0,1,0]}));

      this.world.addLightSource(Jax.Scene.LightSource.find("spot_light"));
      this.world.addObject(new Jax.Model({mesh:new Jax.Mesh.Sphere({color:[0.5,0.5,0.5,1]}), shadow_caster: false, lit:false, position:[0,0,30]}));

      var point_light = Jax.Scene.LightSource.find("point_light");
      this.world.addLightSource(point_light);
      this.world.addObject(new Jax.Model({mesh:new Jax.Mesh.Sphere({color:[0.5,0,0,1]}), shadow_caster: false, lit:false, position:point_light.getPosition()}));

      this.world.addLightSource(Jax.Scene.LightSource.find("directional_light"));

      this.player.camera.setPosition(0,15,50);
      this.player.camera.lookAt([0,0,0]);
    },

    /* this updater will take care of pivoting the spotlight horizontally over time. */
    update: function(timechange) {
      var spotlight = this.context.world.lighting.getLight(0);
      var speed = Math.PI/4; // pivot at a speed of 45 degrees per second
      var rotation_direction = this.rotation_per_second || speed;

      var view = spotlight.camera.getViewVector();
      if (view[0] > Math.sqrt(2)/2)       this.rotation_per_second =  speed;
      else if (view[0] < -Math.sqrt(2)/2) this.rotation_per_second = -speed;

      spotlight.camera.rotate(rotation_direction*timechange, 0, 1, 0);

      var speed = 25 * timechange;

      this.player.camera.move((movement.forward + movement.backward) * speed);
      this.player.camera.strafe((movement.left + movement.right) * speed);
    },

    key_pressed: function(event) {
      switch(event.keyCode) {
        case KeyEvent.DOM_VK_W: movement.forward = 1; break;
        case KeyEvent.DOM_VK_S: movement.backward = -1; break;
        case KeyEvent.DOM_VK_A: movement.left = -1; break;
        case KeyEvent.DOM_VK_D: movement.right = 1; break;
      }
    },

    key_released: function(event) {
      switch(event.keyCode) {
        case KeyEvent.DOM_VK_W: movement.forward = 0; break;
        case KeyEvent.DOM_VK_S: movement.backward = 0; break;
        case KeyEvent.DOM_VK_A: movement.left = 0; break;
        case KeyEvent.DOM_VK_D: movement.right = 0; break;
      }
    },

    /* dragging the mouse will pan the object */
    mouse_dragged: function(event) {
      var camera = this.world.getObject(0).camera;
      camera.move(0.175, [this.context.mouse.diffx, 0, -this.context.mouse.diffy]);
    }
  });
})();
Jax.views.push('main/index', function() {
  this.glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  this.world.render();
});
Jax.shaders['basic'] = new Jax.Shader({  common:"shared uniform mat4 ivMatrix, mvMatrix, pMatrix, vMatrix;\nshared uniform mat3 vnMatrix, nMatrix;\n\nshared uniform vec4 materialDiffuse, materialAmbient, materialSpecular;\nshared uniform float materialShininess;\n\nshared uniform int PASS_TYPE;\n\nshared varying vec2 vTexCoords;\nshared varying vec3 vNormal, vSurfacePos;\nshared varying vec4 vBaseColor;\n",
  fragment:"void main(inout vec4 ambient, inout vec4 diffuse, inout vec4 specular) {\n  ambient = materialAmbient * vBaseColor;\n  diffuse = materialDiffuse * vBaseColor;\n  specular = materialSpecular * vBaseColor;\n}\n",
  vertex:"shared attribute vec2 VERTEX_TEXCOORDS;\nshared attribute vec3 VERTEX_NORMAL;\nshared attribute vec4 VERTEX_POSITION, VERTEX_COLOR, VERTEX_TANGENT;\n\nvoid main(void) {\n  vBaseColor = VERTEX_COLOR;\n  vNormal = nMatrix * VERTEX_NORMAL;\n  vTexCoords = VERTEX_TEXCOORDS;\n                          \n  vSurfacePos = (mvMatrix * VERTEX_POSITION).xyz;\n\n  gl_Position = pMatrix * mvMatrix * VERTEX_POSITION;\n}\n",
exports: {},
name: "basic"});
Jax.shaders['depthmap'] = new Jax.Shader({  common:"shared uniform mat4 pMatrix;\n",
  fragment:"          #ifndef dependency_functions_depth_map\n          #define dependency_functions_depth_map\n      \n          vec4 pack_depth(const in float depth)\n{\n  const vec4 bit_shift = vec4(256.0*256.0*256.0, 256.0*256.0, 256.0, 1.0);\n  const vec4 bit_mask  = vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0);\n  vec4 res = fract(depth * bit_shift);\n  res -= res.xxyz * bit_mask;\n  return res;\n}\n\n/*\nfloat linearize(in float z) {\n  float A = pMatrix[2].z, B = pMatrix[3].z;\n  float n = - B / (1.0 - A); // camera z near\n  float f =   B / (1.0 + A); // camera z far\n  return (2.0 * n) / (f + n - z * (f - n));\n}\n*/\n\nfloat unpack_depth(const in vec4 rgba_depth)\n{\n  const vec4 bit_shift = vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0);\n  float depth = dot(rgba_depth, bit_shift);\n  return depth;\n}\n\n          #endif\n\n\nvoid main(void) {\n  vec4 pos = gl_FragCoord;\n  import(exPos, pos = exPos);\n  gl_FragColor = pack_depth(pos.z);\n}\n",
  vertex:"shared attribute vec4 VERTEX_POSITION;\n    \nshared uniform mat4 mvMatrix;\n            \nvoid main(void) {\n  vec4 pos = pMatrix * mvMatrix * VERTEX_POSITION;\n  import(Position, pos = Position);\n  \n  gl_Position = pos;\n}\n",
exports: {},
name: "depthmap"});
Jax.shaders['fog'] = new Jax.Shader({  common:"uniform vec4 FogColor;\n\nuniform int Algorithm;\n\nuniform float Scale;\nuniform float End;\nuniform float Density;\n",
  fragment:"const float LOG2 = 1.442695;\n\nvoid main(inout vec4 ambient, inout vec4 diffuse, inout vec4 specular) {\n  float fog;\n  float error = 0.0;\n  float distance = length(gl_FragCoord.z / gl_FragCoord.w);\n\n  if (Algorithm == <%=Jax.LINEAR%>) {\n    fog = (End - distance) * Scale;\n  } else if (Algorithm == <%=Jax.EXPONENTIAL%>) {\n    fog = exp(-Density * distance);\n  } else if (Algorithm == <%=Jax.EXP2%>) {\n    fog = exp2(-Density * Density * distance * distance * LOG2);\n  } else {\n    /* error condition, output red */\n    ambient = diffuse = specular = vec4(1,0,0,1);\n    error = 1.0;\n  }\n\n  if (error != 1.0) {\n    fog = clamp(fog, 0.0, 1.0);\n  \n    ambient  = mix(FogColor,  ambient,  fog);\n    diffuse  = mix(FogColor,  diffuse,  fog);\n  }\n}\n",
  vertex:"shared attribute vec4 VERTEX_POSITION;\n\nshared uniform mat4 mvMatrix, pMatrix;\n\nconst float LOG2 = 1.442695;\n\nvoid main(void) {\n  vec4 pos = mvMatrix * VERTEX_POSITION;\n  gl_Position = pMatrix * pos;\n}\n",
exports: {},
name: "fog"});
Jax.shaders['lighting'] = new Jax.Shader({  common:"          #ifndef dependency_functions_lights\n          #define dependency_functions_lights\n      \n          /* see http://jax.thoughtsincomputation.com/2011/05/webgl-apps-crashing-on-windows-7/ */\n//const struct LightSource {\n//  int enabled;\n//  int type;\n//  vec3 position; // in world space\n//  vec3 direction; // in world space\n//  vec4 ambient, diffuse, specular;\n//  float constant_attenuation, linear_attenuation, quadratic_attenuation;\n//  float spotExponent, spotCosCutoff;\n//};\n\nshared uniform bool LIGHT_ENABLED;\nshared uniform int LIGHT_TYPE;\nshared uniform vec3 LIGHT_POSITION, LIGHT_DIRECTION;\nshared uniform vec4 LIGHT_AMBIENT, LIGHT_DIFFUSE, LIGHT_SPECULAR;\nshared uniform float LIGHT_ATTENUATION_CONSTANT, LIGHT_ATTENUATION_LINEAR, LIGHT_ATTENUATION_QUADRATIC,\n                     LIGHT_SPOT_EXPONENT, LIGHT_SPOT_COS_CUTOFF;\n\nfloat calcAttenuation(in vec3 ecPosition3,\n                      out vec3 lightDirection)\n{\n//  lightDirection = vec3(vnMatrix * -light.position) - ecPosition3;\n  lightDirection = vec3(ivMatrix * vec4(LIGHT_POSITION, 1.0)) - ecPosition3;\n  float d = length(lightDirection);\n  \n  return 1.0 / (LIGHT_ATTENUATION_CONSTANT + LIGHT_ATTENUATION_LINEAR * d + LIGHT_ATTENUATION_QUADRATIC * d * d);\n}\n\nvoid DirectionalLight(in vec3 normal,\n                      inout vec4 ambient,\n                      inout vec4 diffuse,\n                      inout vec4 specular)\n{\n  vec3 nLDir = normalize(vnMatrix * -normalize(LIGHT_DIRECTION));\n  vec3 halfVector = normalize(nLDir + vec3(0,0,1));\n  float pf;\n    \n  float NdotD  = max(0.0, dot(normal, nLDir));\n  float NdotHV = max(0.0, dot(normal, halfVector));\n    \n  if (NdotD == 0.0) pf = 0.0;\n  else pf = pow(NdotHV, materialShininess);\n    \n  ambient += LIGHT_AMBIENT;\n  diffuse += LIGHT_DIFFUSE * NdotD;\n  specular += LIGHT_SPECULAR * pf;\n}\n\n/* Use when attenuation != (1,0,0) */\nvoid PointLightWithAttenuation(in vec3 ecPosition3,\n                               in vec3 normal,\n                               inout vec4 ambient,\n                               inout vec4 diffuse,\n                               inout vec4 specular)\n{\n  float NdotD; // normal . light direction\n  float NdotHV;// normal . half vector\n  float pf;    // specular factor\n  float attenuation;\n  vec3 VP;     // direction from surface to light position\n  vec3 halfVector; // direction of maximum highlights\n  \n  attenuation = calcAttenuation(ecPosition3, VP);\n  VP = normalize(VP);\n  \n  halfVector = normalize(VP+vec3(0,0,1));\n  NdotD = max(0.0, dot(normal, VP));\n  NdotHV= max(0.0, dot(normal, halfVector));\n  \n  if (NdotD == 0.0) pf = 0.0;\n  else pf = pow(NdotHV, materialShininess);\n\n  ambient += LIGHT_AMBIENT * attenuation;\n  diffuse += LIGHT_DIFFUSE * NdotD * attenuation;\n  specular += LIGHT_SPECULAR * pf * attenuation;\n}\n\n/* Use for better performance when attenuation == (1,0,0) */\nvoid PointLightWithoutAttenuation(in vec3 ecPosition3,\n                                  in vec3 normal,\n                                  inout vec4 ambient,\n                                  inout vec4 diffuse,\n                                  inout vec4 specular)\n{\n  float NdotD; // normal . light direction\n  float NdotHV;// normal . half vector\n  float pf;    // specular factor\n  float d;     // distance from surface to light source\n  vec3 VP;     // direction from surface to light position\n  vec3 halfVector; // direction of maximum highlights\n  \n  VP = vec3(ivMatrix * vec4(LIGHT_POSITION, 1.0)) - ecPosition3;\n  d = length(VP);\n  VP = normalize(VP);\n  halfVector = normalize(VP+vec3(0,0,1));\n  NdotD = max(0.0, dot(normal, VP));\n  NdotHV= max(0.0, dot(normal, halfVector));\n  \n  if (NdotD == 0.0) pf = 0.0;\n  else pf = pow(NdotHV, materialShininess);\n  \n  ambient += LIGHT_AMBIENT;\n  diffuse += LIGHT_DIFFUSE * NdotD;\n  specular += LIGHT_SPECULAR * pf;\n}\n\nvoid SpotLight(in vec3 ecPosition3,\n               in vec3 normal,\n               inout vec4 ambient,\n               inout vec4 diffuse,\n               inout vec4 specular)\n{\n  float NdotD; // normal . light direction\n  float NdotHV;// normal . half vector\n  float pf;    // specular factor\n  float attenuation;\n  vec3 VP;     // direction from surface to light position\n  vec3 halfVector; // direction of maximum highlights\n  float spotDot; // cosine of angle between spotlight\n  float spotAttenuation; // spotlight attenuation factor\n  \n  attenuation = calcAttenuation(ecPosition3, VP);\n  VP = normalize(VP);\n  \n  // See if point on surface is inside cone of illumination\n  spotDot = dot(-VP, normalize(vnMatrix*LIGHT_DIRECTION));\n  if (spotDot < LIGHT_SPOT_COS_CUTOFF)\n    spotAttenuation = 0.0;\n  else spotAttenuation = pow(spotDot, LIGHT_SPOT_EXPONENT);\n  \n  attenuation *= spotAttenuation;\n  \n  halfVector = normalize(VP+vec3(0,0,1));\n  NdotD = max(0.0, dot(normal, VP));\n  NdotHV= max(0.0, dot(normal, halfVector));\n  \n  if (NdotD == 0.0) pf = 0.0;\n  else pf = pow(NdotHV, materialShininess);\n  \n  ambient += LIGHT_AMBIENT * attenuation;\n  diffuse += LIGHT_DIFFUSE * NdotD * attenuation;\n  specular += LIGHT_SPECULAR * pf * attenuation;\n}\n\n          #endif\n\n\nshared uniform bool LIGHTING_ENABLED;\n\nshared varying vec3 vLightDir;",
  fragment:"void main(inout vec4 ambient, inout vec4 diffuse, inout vec4 specular) {\n  vec4 _ambient = vec4(0,0,0,0), _diffuse = vec4(0,0,0,0), _specular = vec4(0,0,0,0);\n  vec3 nNormal = normalize(vNormal);\n\n  if (LIGHTING_ENABLED) {\n    if (LIGHT_TYPE == <%=Jax.DIRECTIONAL_LIGHT%>)\n      DirectionalLight(nNormal, _ambient, _diffuse, _specular);\n    else\n      if (LIGHT_TYPE == <%=Jax.POINT_LIGHT%>)\n        if (LIGHT_ATTENUATION_CONSTANT == 1.0 && LIGHT_ATTENUATION_LINEAR == 0.0 && LIGHT_ATTENUATION_QUADRATIC == 0.0)\n          PointLightWithoutAttenuation(vSurfacePos, nNormal, _ambient, _diffuse, _specular);\n        else\n          PointLightWithAttenuation(vSurfacePos, nNormal, _ambient, _diffuse, _specular);\n      else\n        if (LIGHT_TYPE == <%=Jax.SPOT_LIGHT%>)\n          SpotLight(vSurfacePos, nNormal, _ambient, _diffuse, _specular);\n        else\n        { // error condition, output 100% red\n          _ambient = _diffuse = _specular = vec4(1,0,0,1);\n        }\n  } else {\n    _ambient = vec4(1,1,1,1);\n    _diffuse = _specular = vec4(0,0,0,0);\n  }\n\n  /*\n    Light colors will be multiplied by material colors. Light can't really be transparent,\n    so we'll use alpha to represent intensity. This means we must multiply resultant light\n    colors by light alpha, and then hard-code alpha 1 to avoid polluting transparency.\n    \n    The reason we use LIGHT_*.a instead of _*.a is because _*.a has been tainted by attenuation.\n    A light's intensity, regardless of distance or relative brightness, has not actually changed;\n    attenuation has been factored into color already; we don't want to square the atten amt.\n  */\n  ambient *= vec4(_ambient.rgb * LIGHT_AMBIENT.a, 1.0);\n  diffuse *= vec4(_diffuse.rgb * LIGHT_DIFFUSE.a, 1.0);\n  specular *= vec4(_specular.rgb * LIGHT_SPECULAR.a, 1.0);\n}\n",
  vertex:"shared attribute vec2 VERTEX_TEXCOORDS;\nshared attribute vec3 VERTEX_NORMAL;\nshared attribute vec4 VERTEX_POSITION, VERTEX_COLOR, VERTEX_TANGENT;\n\nvoid main(void) {\n  vLightDir = normalize(vnMatrix * -normalize(LIGHT_DIRECTION));\n}\n",
exports: {},
name: "lighting"});
Jax.shaders['normal_map'] = new Jax.Shader({  common:"          #ifndef dependency_functions_lights\n          #define dependency_functions_lights\n      \n          /* see http://jax.thoughtsincomputation.com/2011/05/webgl-apps-crashing-on-windows-7/ */\n//const struct LightSource {\n//  int enabled;\n//  int type;\n//  vec3 position; // in world space\n//  vec3 direction; // in world space\n//  vec4 ambient, diffuse, specular;\n//  float constant_attenuation, linear_attenuation, quadratic_attenuation;\n//  float spotExponent, spotCosCutoff;\n//};\n\nshared uniform bool LIGHT_ENABLED;\nshared uniform int LIGHT_TYPE;\nshared uniform vec3 LIGHT_POSITION, LIGHT_DIRECTION;\nshared uniform vec4 LIGHT_AMBIENT, LIGHT_DIFFUSE, LIGHT_SPECULAR;\nshared uniform float LIGHT_ATTENUATION_CONSTANT, LIGHT_ATTENUATION_LINEAR, LIGHT_ATTENUATION_QUADRATIC,\n                     LIGHT_SPOT_EXPONENT, LIGHT_SPOT_COS_CUTOFF;\n\nfloat calcAttenuation(in vec3 ecPosition3,\n                      out vec3 lightDirection)\n{\n//  lightDirection = vec3(vnMatrix * -light.position) - ecPosition3;\n  lightDirection = vec3(ivMatrix * vec4(LIGHT_POSITION, 1.0)) - ecPosition3;\n  float d = length(lightDirection);\n  \n  return 1.0 / (LIGHT_ATTENUATION_CONSTANT + LIGHT_ATTENUATION_LINEAR * d + LIGHT_ATTENUATION_QUADRATIC * d * d);\n}\n\nvoid DirectionalLight(in vec3 normal,\n                      inout vec4 ambient,\n                      inout vec4 diffuse,\n                      inout vec4 specular)\n{\n  vec3 nLDir = normalize(vnMatrix * -normalize(LIGHT_DIRECTION));\n  vec3 halfVector = normalize(nLDir + vec3(0,0,1));\n  float pf;\n    \n  float NdotD  = max(0.0, dot(normal, nLDir));\n  float NdotHV = max(0.0, dot(normal, halfVector));\n    \n  if (NdotD == 0.0) pf = 0.0;\n  else pf = pow(NdotHV, materialShininess);\n    \n  ambient += LIGHT_AMBIENT;\n  diffuse += LIGHT_DIFFUSE * NdotD;\n  specular += LIGHT_SPECULAR * pf;\n}\n\n/* Use when attenuation != (1,0,0) */\nvoid PointLightWithAttenuation(in vec3 ecPosition3,\n                               in vec3 normal,\n                               inout vec4 ambient,\n                               inout vec4 diffuse,\n                               inout vec4 specular)\n{\n  float NdotD; // normal . light direction\n  float NdotHV;// normal . half vector\n  float pf;    // specular factor\n  float attenuation;\n  vec3 VP;     // direction from surface to light position\n  vec3 halfVector; // direction of maximum highlights\n  \n  attenuation = calcAttenuation(ecPosition3, VP);\n  VP = normalize(VP);\n  \n  halfVector = normalize(VP+vec3(0,0,1));\n  NdotD = max(0.0, dot(normal, VP));\n  NdotHV= max(0.0, dot(normal, halfVector));\n  \n  if (NdotD == 0.0) pf = 0.0;\n  else pf = pow(NdotHV, materialShininess);\n\n  ambient += LIGHT_AMBIENT * attenuation;\n  diffuse += LIGHT_DIFFUSE * NdotD * attenuation;\n  specular += LIGHT_SPECULAR * pf * attenuation;\n}\n\n/* Use for better performance when attenuation == (1,0,0) */\nvoid PointLightWithoutAttenuation(in vec3 ecPosition3,\n                                  in vec3 normal,\n                                  inout vec4 ambient,\n                                  inout vec4 diffuse,\n                                  inout vec4 specular)\n{\n  float NdotD; // normal . light direction\n  float NdotHV;// normal . half vector\n  float pf;    // specular factor\n  float d;     // distance from surface to light source\n  vec3 VP;     // direction from surface to light position\n  vec3 halfVector; // direction of maximum highlights\n  \n  VP = vec3(ivMatrix * vec4(LIGHT_POSITION, 1.0)) - ecPosition3;\n  d = length(VP);\n  VP = normalize(VP);\n  halfVector = normalize(VP+vec3(0,0,1));\n  NdotD = max(0.0, dot(normal, VP));\n  NdotHV= max(0.0, dot(normal, halfVector));\n  \n  if (NdotD == 0.0) pf = 0.0;\n  else pf = pow(NdotHV, materialShininess);\n  \n  ambient += LIGHT_AMBIENT;\n  diffuse += LIGHT_DIFFUSE * NdotD;\n  specular += LIGHT_SPECULAR * pf;\n}\n\nvoid SpotLight(in vec3 ecPosition3,\n               in vec3 normal,\n               inout vec4 ambient,\n               inout vec4 diffuse,\n               inout vec4 specular)\n{\n  float NdotD; // normal . light direction\n  float NdotHV;// normal . half vector\n  float pf;    // specular factor\n  float attenuation;\n  vec3 VP;     // direction from surface to light position\n  vec3 halfVector; // direction of maximum highlights\n  float spotDot; // cosine of angle between spotlight\n  float spotAttenuation; // spotlight attenuation factor\n  \n  attenuation = calcAttenuation(ecPosition3, VP);\n  VP = normalize(VP);\n  \n  // See if point on surface is inside cone of illumination\n  spotDot = dot(-VP, normalize(vnMatrix*LIGHT_DIRECTION));\n  if (spotDot < LIGHT_SPOT_COS_CUTOFF)\n    spotAttenuation = 0.0;\n  else spotAttenuation = pow(spotDot, LIGHT_SPOT_EXPONENT);\n  \n  attenuation *= spotAttenuation;\n  \n  halfVector = normalize(VP+vec3(0,0,1));\n  NdotD = max(0.0, dot(normal, VP));\n  NdotHV= max(0.0, dot(normal, halfVector));\n  \n  if (NdotD == 0.0) pf = 0.0;\n  else pf = pow(NdotHV, materialShininess);\n  \n  ambient += LIGHT_AMBIENT * attenuation;\n  diffuse += LIGHT_DIFFUSE * NdotD * attenuation;\n  specular += LIGHT_SPECULAR * pf * attenuation;\n}\n\n          #endif\n\n\nuniform sampler2D NormalMap;\n\nshared uniform mat4 mvMatrix, pMatrix, vMatrix;\nshared uniform mat3 nMatrix;\n\nshared varying vec2 vTexCoords;\n\nvarying vec3 vEyeDir;\nvarying vec3 vLightDir;\nvarying float vAttenuation;\n",
  fragment:"void main(inout vec4 ambient, inout vec4 diffuse, inout vec4 specular) {\n  // ambient was applied by the basic shader; applying it again will simply brighten some fragments\n  // beyond their proper ambient value. So, we really need to apply the bump shader ONLY to diffuse+specular.\n\n  if (PASS_TYPE != <%=Jax.Scene.AMBIENT_PASS%>) {\n    vec3 nLightDir = normalize(vLightDir);\n    vec3 nEyeDir = normalize(vEyeDir);\n    vec4 color = texture2D(NormalMap, vTexCoords);\n    vec3 map = //nMatrix * \n               normalize(color.xyz * 2.0 - 1.0);\n             \n    float litColor = max(dot(map, nLightDir), 0.0) * vAttenuation;\n\n    // specular\n    vec3 reflectDir = reflect(nLightDir, map);\n    float spec = max(dot(nEyeDir, reflectDir), 0.0);\n    spec = pow(spec, materialShininess);\n\n    // Treat alpha in the normal map as a specular map; if it's unused it will be 1 and this\n    // won't matter.\n    spec *= color.a;\n  \n    diffuse *= litColor;\n    specular *= spec;\n  }\n}\n",
  vertex:"shared attribute vec4 VERTEX_POSITION;\nshared attribute vec2 VERTEX_TEXCOORDS;\nshared attribute vec4 VERTEX_TANGENT;\nshared attribute vec3 VERTEX_NORMAL;\n\nvoid main(void) {\n  // ambient was applied by the basic shader; applying it again will simply brighten some fragments\n  // beyond their proper ambient value. So, we really need to apply the bump shader ONLY to diffuse+specular.\n\n  if (PASS_TYPE != <%=Jax.Scene.AMBIENT_PASS%>) {\n    vec3 ecPosition = vec3(mvMatrix * VERTEX_POSITION);\n\n    gl_Position = pMatrix * mvMatrix * VERTEX_POSITION;\n    vTexCoords = VERTEX_TEXCOORDS;\n\n    vEyeDir = vec3(mvMatrix * VERTEX_POSITION);\n  \n    vec3 n = normalize(nMatrix * VERTEX_NORMAL);\n    vec3 t = normalize(nMatrix * VERTEX_TANGENT.xyz);\n    vec3 b = cross(n, t) * VERTEX_TANGENT.w;\n  \n    vec3 v, p;\n  \n    vAttenuation = 1.0;\n  \n    if (LIGHT_TYPE == <%=Jax.POINT_LIGHT%>)\n      if (LIGHT_ATTENUATION_CONSTANT == 1.0 && LIGHT_ATTENUATION_LINEAR == 0.0 && LIGHT_ATTENUATION_QUADRATIC == 0.0) {\n        // no change to attenuation, but we still need P\n        p = vec3(ivMatrix * vec4(LIGHT_POSITION, 1.0)) - ecPosition;\n      }\n      else {\n        // attenuation calculation figures out P for us, so we may as well use it\n        vAttenuation = calcAttenuation(ecPosition, p);\n      }\n    else\n      if (LIGHT_TYPE == <%=Jax.SPOT_LIGHT%>) {\n        // attenuation calculation figures out P for us, so we may as well use it\n        vAttenuation = calcAttenuation(ecPosition, p);\n      }\n      else\n      { // directional light -- all we need is P\n        p = vec3(vnMatrix * -normalize(LIGHT_DIRECTION));\n      }\n    \n    \n    \n    v.x = dot(p, t);\n    v.y = dot(p, b);\n    v.z = dot(p, n);\n    vLightDir = normalize(p);\n  \n    v.x = dot(vEyeDir, t);\n    v.y = dot(vEyeDir, b);\n    v.z = dot(vEyeDir, n);\n    vEyeDir = normalize(v);\n  }\n}\n",
exports: {},
name: "normal_map"});
Jax.shaders['paraboloid'] = new Jax.Shader({  common:"shared uniform mat4 mvMatrix;\nshared uniform float DP_SHADOW_NEAR, DP_SHADOW_FAR;\nshared uniform float DP_DIRECTION;\n\nvarying float vClip;\nvarying vec4 vPos;\n",
  fragment:"void main(void) {\n  /* because we do our own projection, we also have to do our own clipping */\n  /* if vClip is less than 0, it's behind the near plane and can be dropped. */\n  if (vClip < 0.0) discard;\n  \n  export(vec4, exPos, vPos);\n//  gl_FragColor = pack_depth(vPos.z);\n}\n",
  vertex:"shared attribute vec4 VERTEX_POSITION;\n                \nvoid main(void) {\n  /*\n    we do our own projection to form the paraboloid, so we\n    can ignore the projection matrix entirely.\n   */\n  vec4 pos = mvMatrix * VERTEX_POSITION;\n\n  pos = vec4(pos.xyz / pos.w, pos.w);\n\n  pos.z *= DP_DIRECTION;\n\n  float L = length(pos.xyz);\n  pos /= L;\n  vClip = pos.z;\n\n  pos.z += 1.0;\n  pos.x /= pos.z;\n  pos.y /= pos.z;\n  pos.z = (L - DP_SHADOW_NEAR) / (DP_SHADOW_FAR - DP_SHADOW_NEAR);\n  pos.w = 1.0;\n\n  vPos = pos;\n  export(vec4, Position, pos);\n  gl_Position = pos;\n}\n",
exports: {"exPos":"vec4","Position":"vec4"},
name: "paraboloid"});
Jax.shaders['picking'] = new Jax.Shader({  common:"uniform float INDEX;\nvarying vec4 vColor;\n",
  fragment:"void main(void) {\n  if (INDEX == -1.0) discard;\n  gl_FragColor = vColor;\n}\n",
  vertex:"shared attribute vec4 VERTEX_POSITION;\n\nshared uniform mat4 mvMatrix, pMatrix;\n\nvoid main(void) {\n  gl_Position = pMatrix * mvMatrix * VERTEX_POSITION;\n  \n  /*\n    Note that the agorithm here must be followed exactly on the JS side in order\n    to reconstitute the index when it is read.\n    \n    This supports 65,535 objects. If more are needed, we could feasibly open up\n    the alpha channel, as long as blending is disabled. Need to do more tests\n    on this first, however.\n  */\n  \n  \n  // equivalent to [ int(INDEX/256), INDEX % 256 ] / 255. The last division\n  // is necessary to scale to the [0..1] range.\n  \n  float d = 1.0 / 255.0;\n  float f = floor(INDEX / 256.0);\n  vColor = vec4(f * d, (INDEX - 256.0 * f) * d, 1.0, 1.0);\n}\n",
exports: {},
name: "picking"});
Jax.shaders['shadow_map'] = new Jax.Shader({  common:"shared uniform mat4 mMatrix;\n\nuniform bool SHADOWMAP_ENABLED;\nuniform sampler2D SHADOWMAP0, SHADOWMAP1;\nuniform mat4 SHADOWMAP_MATRIX;\nuniform bool SHADOWMAP_PCF_ENABLED;\nuniform float DP_SHADOW_NEAR, DP_SHADOW_FAR;\n\nvarying vec4 vShadowCoord;\n\nvarying vec4 vDP0, vDP1;\n//varying float vDPz, vDPDepth;\n\n          #ifndef dependency_functions_lights\n          #define dependency_functions_lights\n      \n          /* see http://jax.thoughtsincomputation.com/2011/05/webgl-apps-crashing-on-windows-7/ */\n//const struct LightSource {\n//  int enabled;\n//  int type;\n//  vec3 position; // in world space\n//  vec3 direction; // in world space\n//  vec4 ambient, diffuse, specular;\n//  float constant_attenuation, linear_attenuation, quadratic_attenuation;\n//  float spotExponent, spotCosCutoff;\n//};\n\nshared uniform bool LIGHT_ENABLED;\nshared uniform int LIGHT_TYPE;\nshared uniform vec3 LIGHT_POSITION, LIGHT_DIRECTION;\nshared uniform vec4 LIGHT_AMBIENT, LIGHT_DIFFUSE, LIGHT_SPECULAR;\nshared uniform float LIGHT_ATTENUATION_CONSTANT, LIGHT_ATTENUATION_LINEAR, LIGHT_ATTENUATION_QUADRATIC,\n                     LIGHT_SPOT_EXPONENT, LIGHT_SPOT_COS_CUTOFF;\n\nfloat calcAttenuation(in vec3 ecPosition3,\n                      out vec3 lightDirection)\n{\n//  lightDirection = vec3(vnMatrix * -light.position) - ecPosition3;\n  lightDirection = vec3(ivMatrix * vec4(LIGHT_POSITION, 1.0)) - ecPosition3;\n  float d = length(lightDirection);\n  \n  return 1.0 / (LIGHT_ATTENUATION_CONSTANT + LIGHT_ATTENUATION_LINEAR * d + LIGHT_ATTENUATION_QUADRATIC * d * d);\n}\n\nvoid DirectionalLight(in vec3 normal,\n                      inout vec4 ambient,\n                      inout vec4 diffuse,\n                      inout vec4 specular)\n{\n  vec3 nLDir = normalize(vnMatrix * -normalize(LIGHT_DIRECTION));\n  vec3 halfVector = normalize(nLDir + vec3(0,0,1));\n  float pf;\n    \n  float NdotD  = max(0.0, dot(normal, nLDir));\n  float NdotHV = max(0.0, dot(normal, halfVector));\n    \n  if (NdotD == 0.0) pf = 0.0;\n  else pf = pow(NdotHV, materialShininess);\n    \n  ambient += LIGHT_AMBIENT;\n  diffuse += LIGHT_DIFFUSE * NdotD;\n  specular += LIGHT_SPECULAR * pf;\n}\n\n/* Use when attenuation != (1,0,0) */\nvoid PointLightWithAttenuation(in vec3 ecPosition3,\n                               in vec3 normal,\n                               inout vec4 ambient,\n                               inout vec4 diffuse,\n                               inout vec4 specular)\n{\n  float NdotD; // normal . light direction\n  float NdotHV;// normal . half vector\n  float pf;    // specular factor\n  float attenuation;\n  vec3 VP;     // direction from surface to light position\n  vec3 halfVector; // direction of maximum highlights\n  \n  attenuation = calcAttenuation(ecPosition3, VP);\n  VP = normalize(VP);\n  \n  halfVector = normalize(VP+vec3(0,0,1));\n  NdotD = max(0.0, dot(normal, VP));\n  NdotHV= max(0.0, dot(normal, halfVector));\n  \n  if (NdotD == 0.0) pf = 0.0;\n  else pf = pow(NdotHV, materialShininess);\n\n  ambient += LIGHT_AMBIENT * attenuation;\n  diffuse += LIGHT_DIFFUSE * NdotD * attenuation;\n  specular += LIGHT_SPECULAR * pf * attenuation;\n}\n\n/* Use for better performance when attenuation == (1,0,0) */\nvoid PointLightWithoutAttenuation(in vec3 ecPosition3,\n                                  in vec3 normal,\n                                  inout vec4 ambient,\n                                  inout vec4 diffuse,\n                                  inout vec4 specular)\n{\n  float NdotD; // normal . light direction\n  float NdotHV;// normal . half vector\n  float pf;    // specular factor\n  float d;     // distance from surface to light source\n  vec3 VP;     // direction from surface to light position\n  vec3 halfVector; // direction of maximum highlights\n  \n  VP = vec3(ivMatrix * vec4(LIGHT_POSITION, 1.0)) - ecPosition3;\n  d = length(VP);\n  VP = normalize(VP);\n  halfVector = normalize(VP+vec3(0,0,1));\n  NdotD = max(0.0, dot(normal, VP));\n  NdotHV= max(0.0, dot(normal, halfVector));\n  \n  if (NdotD == 0.0) pf = 0.0;\n  else pf = pow(NdotHV, materialShininess);\n  \n  ambient += LIGHT_AMBIENT;\n  diffuse += LIGHT_DIFFUSE * NdotD;\n  specular += LIGHT_SPECULAR * pf;\n}\n\nvoid SpotLight(in vec3 ecPosition3,\n               in vec3 normal,\n               inout vec4 ambient,\n               inout vec4 diffuse,\n               inout vec4 specular)\n{\n  float NdotD; // normal . light direction\n  float NdotHV;// normal . half vector\n  float pf;    // specular factor\n  float attenuation;\n  vec3 VP;     // direction from surface to light position\n  vec3 halfVector; // direction of maximum highlights\n  float spotDot; // cosine of angle between spotlight\n  float spotAttenuation; // spotlight attenuation factor\n  \n  attenuation = calcAttenuation(ecPosition3, VP);\n  VP = normalize(VP);\n  \n  // See if point on surface is inside cone of illumination\n  spotDot = dot(-VP, normalize(vnMatrix*LIGHT_DIRECTION));\n  if (spotDot < LIGHT_SPOT_COS_CUTOFF)\n    spotAttenuation = 0.0;\n  else spotAttenuation = pow(spotDot, LIGHT_SPOT_EXPONENT);\n  \n  attenuation *= spotAttenuation;\n  \n  halfVector = normalize(VP+vec3(0,0,1));\n  NdotD = max(0.0, dot(normal, VP));\n  NdotHV= max(0.0, dot(normal, halfVector));\n  \n  if (NdotD == 0.0) pf = 0.0;\n  else pf = pow(NdotHV, materialShininess);\n  \n  ambient += LIGHT_AMBIENT * attenuation;\n  diffuse += LIGHT_DIFFUSE * NdotD * attenuation;\n  specular += LIGHT_SPECULAR * pf * attenuation;\n}\n\n          #endif\n\n",
  fragment:"          #ifndef dependency_functions_depth_map\n          #define dependency_functions_depth_map\n      \n          vec4 pack_depth(const in float depth)\n{\n  const vec4 bit_shift = vec4(256.0*256.0*256.0, 256.0*256.0, 256.0, 1.0);\n  const vec4 bit_mask  = vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0);\n  vec4 res = fract(depth * bit_shift);\n  res -= res.xxyz * bit_mask;\n  return res;\n}\n\n/*\nfloat linearize(in float z) {\n  float A = pMatrix[2].z, B = pMatrix[3].z;\n  float n = - B / (1.0 - A); // camera z near\n  float f =   B / (1.0 + A); // camera z far\n  return (2.0 * n) / (f + n - z * (f - n));\n}\n*/\n\nfloat unpack_depth(const in vec4 rgba_depth)\n{\n  const vec4 bit_shift = vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0);\n  float depth = dot(rgba_depth, bit_shift);\n  return depth;\n}\n\n          #endif\n\n\nfloat dp_lookup() {\n  float map_depth, depth;\n  vec4 rgba_depth;\n      \n  if (vDP0.w > 0.0) {\n    rgba_depth = texture2D(SHADOWMAP0, vDP0.xy);\n    depth = vDP1.w;//P0.z;\n  } else {\n    rgba_depth = texture2D(SHADOWMAP1, vDP1.xy);\n    depth = vDP1.w;//P1.z;\n  }\n      \n      \n  map_depth = unpack_depth(rgba_depth);\n      \n  if (map_depth + 0.00005 < depth) return 0.0;\n  else return 1.0;\n}\n      \nfloat pcf_lookup(float s, vec2 offset) {\n  /*\n    s is the projected depth of the current vShadowCoord relative to the shadow's camera. This represents\n    a *potentially* shadowed surface about to be drawn.\n    \n    d is the actual depth stored within the SHADOWMAP texture (representing the visible surface).\n  \n    if the surface to be drawn is further back than the light-visible surface, then the surface is\n    shadowed because it has a greater depth. Less-or-equal depth means it's either in front of, or it *is*\n    the light-visible surface.\n  */\n  vec2 texcoord = (vShadowCoord.xy/vShadowCoord.w)+offset;\n  vec4 rgba_depth = texture2D(SHADOWMAP0, texcoord);\n  float d = unpack_depth(rgba_depth);\n  return (s - d > 0.00002) ? 0.0 : 1.0;\n}\n\nvoid main(inout vec4 ambient, inout vec4 diffuse, inout vec4 specular) {\n//ambient = vec4(0);\n  if (PASS_TYPE != <%=Jax.Scene.AMBIENT_PASS%> && SHADOWMAP_ENABLED) {\n    float visibility = 1.0;\n    float s = vShadowCoord.z / vShadowCoord.w;\n    if (LIGHT_TYPE == <%=Jax.POINT_LIGHT%>) {\n      visibility = dp_lookup();\n    } else {\n      vec2 offset = vec2(0.0, 0.0);\n      if (!SHADOWMAP_PCF_ENABLED)\n        visibility = pcf_lookup(s, offset);\n      else {\n        // do PCF filtering\n        float dx, dy;\n        visibility = 0.0;\n        for (float dx = -1.5; dx <= 1.5; dx += 1.0)\n          for (float dy = -1.5; dy <= 1.5; dy += 1.0) {\n            offset.x = dx/2048.0;\n            offset.y = dy/2048.0;\n            visibility += pcf_lookup(s, offset);\n          }\n        visibility /= 16.0;\n      }\n    }\n\n    diffuse *= visibility;\n    specular *= visibility;\n  }\n}\n",
  vertex:"void main(void) {\n  if (PASS_TYPE != <%=Jax.Scene.AMBIENT_PASS%> && SHADOWMAP_ENABLED) {\n    vShadowCoord = SHADOWMAP_MATRIX * mMatrix * VERTEX_POSITION;\n    \n    /* Perform dual-paraboloid shadow map calculations - for point lights only */\n    vec4 p = vShadowCoord;\n    vec3 pos = p.xyz / p.w;\n          \n    float L = length(pos.xyz);\n    vDP0.xyz = pos / L;\n    vDP1.xyz = pos / L;\n      \n    vDP0.w = pos.z;    \n    //vDPz = pos.z;\n          \n    vDP0.z = 1.0 + vDP0.z;\n    vDP0.x /= vDP0.z;\n    vDP0.y /= vDP0.z;\n    vDP0.z = (L - DP_SHADOW_NEAR) / (DP_SHADOW_FAR - DP_SHADOW_NEAR);\n          \n    vDP0.x =  0.5 * vDP0.x + 0.5;\n    vDP0.y =  0.5 * vDP0.y + 0.5;\n          \n    vDP1.z = 1.0 - vDP1.z;\n    vDP1.x /= vDP1.z;\n    vDP1.y /= vDP1.z;\n    vDP1.z = (L - DP_SHADOW_NEAR) / (DP_SHADOW_FAR - DP_SHADOW_NEAR);\n      \n    vDP1.x =  0.5 * vDP1.x + 0.5;\n    vDP1.y =  0.5 * vDP1.y + 0.5;\n          \n    float map_depth, depth;\n    vec4 rgba_depth;\n      \n    if (vDP0.w > 0.0) {    \n    //if (vDPz > 0.0) {\n      vDP1.w = vDP0.z;\n      //vDPDepth = vDP0.z;\n    } else {\n      vDP1.w = vDP1.z;\n      //vDPDepth = vDP1.z;\n    }\n  }\n}\n",
exports: {},
name: "shadow_map"});
Jax.shaders['texture'] = new Jax.Shader({  common:"uniform sampler2D Texture;\nuniform float TextureScaleX, TextureScaleY;\n\nshared varying vec2 vTexCoords;\n",
  fragment:"void main(inout vec4 ambient, inout vec4 diffuse, inout vec4 specular) {\n  vec4 t = texture2D(Texture, vTexCoords * vec2(TextureScaleX, TextureScaleY));\n\n  ambient  *= t;\n  diffuse  *= t;\n  specular *= t;\n \n  ambient.a  *= t.a;\n  diffuse.a  *= t.a;\n  specular.a *= t.a;\n}\n",
  vertex:"shared attribute vec4 VERTEX_POSITION;\nshared attribute vec2 VERTEX_TEXCOORDS;\n\nshared uniform mat4 mvMatrix, pMatrix;\n\nvoid main(void) {\n  gl_Position = pMatrix * mvMatrix * VERTEX_POSITION;\n  vTexCoords = VERTEX_TEXCOORDS;\n}\n",
exports: {},
name: "texture"});
LightSource.addResources({"directional_light":{"enabled":true,"shadowcaster":true,"position":"0 20 0","direction":"-1 -1 -1","attenuation":{"constant":1,"linear":0,"quadratic":0},"type":"DIRECTIONAL_LIGHT","color":{"ambient":"0 0 0.00 1","diffuse":"0 0 0.50 1","specular":"0 0 0.75 1"}},"point_light":{"shadowcaster":true,"enabled":true,"position":{"x":-20,"y":0,"z":0},"direction":{"x":1,"y":0,"z":0},"type":"POINT_LIGHT","attenuation":{"constant":0,"linear":0,"quadratic":0.00275},"color":{"ambient":{"red":0,"green":0,"blue":0,"alpha":1},"diffuse":{"red":0.9,"green":0.0,"blue":0.0,"alpha":1.0},"specular":{"red":0.75,"green":0.0,"blue":0.0,"alpha":1.0}}},"spot_light":{"enabled":true,"shadowcaster":true,"position":"0 0 30","direction":"0 0 -1","attenuation":{"constant":0,"linear":0.04,"quadratic":0},"type":"SPOT_LIGHT","spot_exponent":32,"angle":0.5235987755982988,"color":{"ambient":"0.15 0.15 0.15 1","diffuse":"0.75 0.75 0.50 1","specular":"1.00 1.00 1.00 1"}}});
Material.addResources({"lighting_with_shadows":{"ambient":{"red":1.0,"green":1.0,"blue":1.0,"alpha":1.0},"diffuse":{"red":1.0,"green":1.0,"blue":1.0,"alpha":1.0},"specular":{"red":1.0,"green":1.0,"blue":1.0,"alpha":1.0},"shininess":128,"layers":[{"type":"Lighting"},{"type":"ShadowMap"}]}});
Jax.routes.root(MainController, "index");
Jax.routes.map("main/index", MainController, "index");
