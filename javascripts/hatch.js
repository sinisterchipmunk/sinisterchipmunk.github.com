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
var BlenderModel = (function() {
  return Jax.Model.create({
    after_initialize: function() {
      var self = this;
      self.mesh = new Jax.Mesh({
        material: self.material,

        init: function(vertices, colors, texCoords, normals, indices) {
          if (self.data) {
            function push(source, dest, scale) {
              scale = scale || 1.0;
              for (i = 0; source && i < source.length; i++)
                dest.push(source[i] * scale);
            }

            var i, j;
            for (var meshName in self.data)
            {
              var meshData = self.data[meshName];
              push(meshData.vertices, vertices, self.scale);
              push(meshData.indices, indices);
              push(meshData.normals, normals);

              self.mesh.default_material = new Jax.Material({
                layers:[
                  {type:"Lighting"}
                ]
              });

              if (self.isLit())
                self.mesh.default_material.addLayer(new Jax.Material.ShadowMap());

              self.dataRegion = new Jax.DataRegion();
              self.mesh.colorLayers = [];
              self.mesh.uvLayers = [];
              for (i = 0; meshData.colors && i < meshData.colors.length; i++) {
                self.mesh.colorLayers[i] = self.dataRegion.map(Float32Array, meshData.colors[i]);
                var buffer = new Jax.DataBuffer(GL_ARRAY_BUFFER, self.mesh.colorLayers[i], 3);
                self.mesh.default_material.addLayer(new Jax.Material.BlenderColorLayer({dataBuffer:buffer}));

                if (i == 0)
                  push(meshData.colors[i], colors);
              }
              for (i = 0; meshData.textureCoords && i < meshData.textureCoords.length; i++) {

                if (i == 0)
                  push(meshData.textureCoords[i], texCoords);
              }
            }
          }
        }
      });

      if (self.path) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
          if (xhr.readyState == 4) {
            if (xhr.status == 200) { // success
              self.data(JSON.parse(xhr.responseText));
            } else { // error
              self.xhrError = xhr.status+" ("+self.method+" "+self.path+" - async: "+self.async+")";
            }
          }
        };
        xhr.open(self.method, self.path, self.async);
        xhr.send(null);
      }
    },

    render: function($super, context, options) {
      if (this.data)
        $super(context, options);
      if (this.xhrError) {
        throw new Error("AJAX error: "+this.xhrError);
        this.xhrError = null;
      }
    },

    data: function(data) {
      this.data = data;
      this.mesh.rebuild();
    }
  });
})();
Jax.Material.BlenderColorLayer = Jax.Class.create(Jax.Material, {
  initialize: function($super, options) {
    options = Jax.Util.normalizeOptions(options, {
      shader: "blender_color_layer"
    });
    if (!options.dataBuffer) throw new Error("Data buffer is required");
    $super(options);
  },

  setAttributes: function($super, context, mesh, options, attributes) {
    attributes.set('COLOR', this.dataBuffer);
  }
});
var ApplicationHelper = Jax.Helper.create({

});
var HatchHelper = Jax.Helper.create({

});
var TamhatchHelper = Jax.Helper.create({

});
var ApplicationController = (function() {
  return Jax.Controller.create("application", Jax.Controller, {

  });
})();

var HatchController = (function() {
  return Jax.Controller.create("hatch", ApplicationController, {
    index: function() {
      this.teapot =
      this.world.addObject(new Jax.Model({position:[0,0,-9],mesh:new Jax.Mesh.Teapot({size:4})}));

      this.light = new Jax.Scene.LightSource({
        type: Jax.POINT_LIGHT,
        position: [5,0,-5],
        attenuation: { linear: 0.25 }
      });
      this.world.addLightSource(this.light);

    },


    mouse_dragged: function(event) {
      this.teapot.camera.rotate(0.1, [event.diffy, event.diffx, 0]);
    }
  });
})();

var TamhatchController = (function() {
  return Jax.Controller.create("tamhatch", ApplicationController, {
    index: function() {
      this.movement = { left: 0, right: 0, forward: 0, backward: 0 };
      this.world.addObject(BlenderModel.find("table"));
      this.world.addObject(BlenderModel.find("chair1"));
      this.world.addObject(BlenderModel.find("chair2"));
      this.world.addObject(BlenderModel.find("fan-base"));
      var lightBulb = this.world.addObject(BlenderModel.find("lightbulb"));

      var plane = new Jax.Mesh.Quad({size:30,material:"tamhatch"});
      var buf = plane.getTextureCoordsBuffer();
      for (var i = 0; i < buf.js.length; i++)
        buf.js[i] *= 4;
      buf.refresh();
      this.world.addObject(new Jax.Model({mesh:plane,position:[15,0,0],direction:[1,0,0]}));
      this.world.addObject(new Jax.Model({mesh:plane,position:[-15,0,0],direction:[-1,0,0]}));
      this.world.addObject(new Jax.Model({mesh:plane,position:[0,6.15,0],direction:[0,1,0]}));
      this.world.addObject(new Jax.Model({mesh:plane,position:[0,-3,0],direction:[0,-1,0]}));
      this.world.addObject(new Jax.Model({mesh:plane,position:[0,0,15],direction:[0,0,1]}));
      this.world.addObject(new Jax.Model({mesh:plane,position:[0,0,-15],direction:[0,0,-1]}));

      this.fanBlades = [];

      var fanPos = this.fanPos = [[0, 5.55, 0.6], [0.6, 5.55, 0], [0, 5.55, -0.6], [-0.6, 5.55, 0]];
      for (var i = 0; i < 4; i++) {
        this.fanBlades[i] = this.world.addObject(BlenderModel.find("fan-blade"));
        this.fanBlades[i].camera.setPosition(fanPos[i]);
        this.fanBlades[i].camera.yaw((i-1) * Math.PI / 2);
      }


      this.world.addLightSource(new Jax.Scene.LightSource({
        type: Jax.POINT_LIGHT,
        position: lightBulb.camera.getPosition(),
        attenuation: { linear: 0.15 }
      }));

     this.player.camera.reorient([0.95,0,1]);
     this.player.camera.setPosition([-9,3,-10]);
     this.player.camera.pitch(-Math.PI/32);
    },

    update: function(timechange) {
      var speed = 7;
      this.player.camera.move((this.movement.forward+this.movement.backward)*timechange*speed);
      this.player.camera.strafe((this.movement.left+this.movement.right)*timechange*speed);

      var angle = Math.PI / 4 * timechange;
      this._angle = (this._angle || 0) - angle;

      var p = this._p = this._p || vec3.create();
      var sx, sz;

      for (var i = 0; i < 4; i++) {
        var radius = 0.6;
        sx = Math.cos(this._angle + ((i+1) * Math.PI/2)) * radius;
        sz = Math.sin(this._angle + ((i+1) * Math.PI/2)) * radius;
        if (i % 2 > 0) { sx *= -1; sz *= -1; }
        p[0] = sx;
        p[1] = 5.55;
        p[2] = sz;
        this.fanBlades[i].camera.setPosition(p);
        this.fanBlades[i].camera.yaw(angle);
      }
    },

    mouse_dragged: function(event) {
      this.player.camera.yaw(-0.01 * this.context.mouse.diffx);
      this.player.camera.pitch(0.01 * this.context.mouse.diffy);
    },

    key_pressed: function(event) {
      switch(event.keyCode) {
        case KeyEvent.DOM_VK_UP:
        case KeyEvent.DOM_VK_W:
          this.movement.forward = 1;
          break;
        case KeyEvent.DOM_VK_DOWN:
        case KeyEvent.DOM_VK_S:
          this.movement.backward = -1;
          break;
        case KeyEvent.DOM_VK_LEFT:
        case KeyEvent.DOM_VK_A:
          this.movement.left = -1;
          break;
        case KeyEvent.DOM_VK_RIGHT:
        case KeyEvent.DOM_VK_D:
          this.movement.right = 1;
          break;
      }
    },

    key_released: function(event) {
      switch(event.keyCode) {
        case KeyEvent.DOM_VK_UP:
        case KeyEvent.DOM_VK_W:
          this.movement.forward = 0;
          break;
        case KeyEvent.DOM_VK_DOWN:
        case KeyEvent.DOM_VK_S:
          this.movement.backward = 0;
          break;
        case KeyEvent.DOM_VK_LEFT:
        case KeyEvent.DOM_VK_A:
          this.movement.left = 0;
          break;
        case KeyEvent.DOM_VK_RIGHT:
        case KeyEvent.DOM_VK_D:
          this.movement.right = 0;
          break;
      }
    }

  });
})();
Jax.views.push('hatch/index', function() {

  var self = this;

  self.buf = self.buf || new Jax.Framebuffer({
    width:self.context.canvas.width,
    height:self.context.canvas.height,
    depth: true,
    color: GL_RGBA
  });

  self.buf.bind(self.context, function() {
    self.glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    self.world.render();
  });

  self.glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

  var ortho = self.ortho = self.ortho || ((function() {
    var mat = mat4.create();
    mat4.ortho(-0.5,0.5,  -0.5,0.5,  0.1,10.0,  mat);
    return mat;
  })());

  self.context.loadProjectionMatrix(ortho);
  self.context.loadModelMatrix(mat4.IDENTITY);
  self.quad = self.quad || new Jax.Model({
    mesh:new Jax.Mesh.Quad({
      size:1.0,
      material: "xhatch"
    }),
    position:[0,0,-5]
  });
  self.quad.render(self.context, {fbuf:self.buf});
});
Jax.views.push('tamhatch/index', function() {
  this.glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  this.world.render();
});
Jax.Material.Hatch = Jax.Class.create(Jax.Material, {
  initialize: function($super, options) {
    options = Jax.Util.normalizeOptions(options, {
      shader: "hatch",

    });

    this.tam = [];
    for (var i = 1; i <= 6; i++) {
      this.tam.push(new Jax.Texture({
        min_filter: GL_LINEAR,
        mag_filter: GL_LINEAR,
        path:"/images/tam"+i+".png"
      }));
    }
    $super(options);
  },

  setUniforms: function($super, context, mesh, options, uniforms) {
    $super(context, mesh, options, uniforms);

    uniforms.set('mvMatrix', context.getModelViewMatrix());
    uniforms.set('nMatrix', context.getNormalMatrix());
    uniforms.set('pMatrix', context.getProjectionMatrix());

    for (var i = 0; i < 6; i++) {
      uniforms.texture('hatch'+i, this.tam[i], context);
    }
  },

  setAttributes: function($super, context, mesh, options, attributes) {
    attributes.set('VERTEX_POSITION',  mesh.getVertexBuffer());
    attributes.set('VERTEX_COLOR',     mesh.getColorBuffer());
    attributes.set('VERTEX_NORMAL',    mesh.getNormalBuffer());
    attributes.set('VERTEX_TEXCOORDS', mesh.getTextureCoordsBuffer());
  }
});
Jax.Material.Tamhatch = Jax.Class.create(Jax.Material.Lighting, {
  initialize: function($super, options) {
    options = Jax.Util.normalizeOptions(options, {
      shader: "tamhatch",

    });

    $super(options);
    this.shader = "tamhatch";
    this.tam = [];
    for (var i = 1; i <= 6; i++) {
      this.tam.push(new Jax.Texture({
        min_filter: GL_LINEAR,
        mag_filter: GL_LINEAR,
        path:"/images/tam"+i+".png"
      }));
    }
  },

  setUniforms: function($super, context, mesh, options, uniforms) {
    $super(context, mesh, options, uniforms);

    uniforms.set('mvMatrix', context.getModelViewMatrix());
    uniforms.set('nMatrix', context.getNormalMatrix());
    uniforms.set('pMatrix', context.getProjectionMatrix());

    for (var i = 0; i < 6; i++) {
      uniforms.texture('hatch'+i, this.tam[i], context);
    }
  },

  setAttributes: function($super, context, mesh, options, attributes) {
    attributes.set('VERTEX_POSITION',  mesh.getVertexBuffer());
    attributes.set('VERTEX_COLOR',     mesh.getColorBuffer());
    attributes.set('VERTEX_NORMAL',    mesh.getNormalBuffer());
    attributes.set('VERTEX_TEXCOORDS', mesh.getTextureCoordsBuffer());
  }
});
Jax.Material.Xhatch = Jax.Class.create(Jax.Material, {
  initialize: function($super, options) {
    options = Jax.Util.normalizeOptions(options, {
      shader: "xhatch",

    });

    $super(options);
  },

  setUniforms: function($super, context, mesh, options, uniforms) {
    $super(context, mesh, options, uniforms);

    uniforms.set('mvMatrix', context.getModelViewMatrix());
    uniforms.set('nMatrix', context.getNormalMatrix());
    uniforms.set('pMatrix', context.getProjectionMatrix());

    if (options.fbuf) {
      uniforms.texture('sceneTex', options.fbuf.getTexture(context, 0), context);
    }

    this.noise = this.noise || new Jax.Noise(context);
    uniforms.texture('gradTexture', this.noise.grad, context);
    uniforms.texture('simplexTexture', this.noise.simplex, context);
    uniforms.texture('permTexture', this.noise.perm, context);

    uniforms.set('TIME', Jax.uptime);
  },

  setAttributes: function($super, context, mesh, options, attributes) {
    attributes.set('VERTEX_POSITION',  mesh.getVertexBuffer());
    attributes.set('VERTEX_TEXCOORDS', mesh.getTextureCoordsBuffer());
  }
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
Jax.shaders['blender_color_layer'] = new Jax.Shader({  common:"varying vec3 vColor;\n",
  fragment:"void main(inout vec4 ambient, inout vec4 diffuse, inout vec4 specular) {\n  ambient.rgb  *= vColor;\n  diffuse.rgb  *= vColor;\n  specular.rgb *= vColor;\n}\n",
  vertex:"attribute vec3 COLOR;\n\nvoid main(void) {\n  vColor = COLOR;\n}\n",
exports: {},
name: "blender_color_layer"});
Jax.shaders['hatch'] = new Jax.Shader({  common:"// Shared variables save on graphics memory and allow you to \"piggy-back\" off of\n// variables defined in other shaders:\n\nshared uniform mat3 nMatrix;\nshared uniform mat4 mvMatrix, pMatrix;\n\nshared varying vec2 vTexCoords;\nshared varying vec3 vNormal;\nshared varying vec4 vBaseColor;\n\nuniform sampler2D hatch0, hatch1, hatch2, hatch3, hatch4, hatch5;\n\n// If a variable isn't shared, it will be defined specifically for this shader.\n// If this shader is used twice in one materials, unshared variables will be\n// defined twice -- once for each use of the shader.\n\n//   uniform sampler2D Texture;\n//   uniform float TextureScaleX, TextureScaleY;\n",
  fragment:"vec2 texCoord;\nvec3 hatchWeight1,  // weight for pure white (w), and hatch tecture unit 0, 1, 2\n     hatchWeight2;  // weight for pure black (w), and hatch texture unit 3, 4, 5\n\n\nvoid calcHatchWeights(in float hatchLevel) {\n  if (hatchLevel >= 6.0)\n  {\n  \thatchWeight1.x = 1.0;\n  }\n  else if (hatchLevel >= 4.0)\n  {\n  \thatchWeight1.x = 1.0 - (5.0 - hatchLevel);\n  \thatchWeight1.y = 1.0 - hatchWeight1.x;\n  }\n  else if (hatchLevel >= 3.0)\n  {\n  \thatchWeight1.y = 1.0 - (4.0 - hatchLevel);\n  \thatchWeight1.z = 1.0 - hatchWeight1.y;\n  }\n  else if (hatchLevel >= 2.0)\n  {\n  \thatchWeight1.z = 1.0 - (3.0 - hatchLevel);\n  \thatchWeight2.x = 1.0 - hatchWeight1.z;\n  }\n  else if (hatchLevel >= 1.0)\n  {\n  \thatchWeight2.x = 1.0 - (2.0 - hatchLevel);\n  \thatchWeight2.y = 1.0 - hatchWeight2.x;\n  }\n  else\n  {\n  \thatchWeight2.y = 1.0 - (1.0 - hatchLevel);\n  \thatchWeight2.z = 1.0 - hatchWeight1.y;\n  }\n}\n\nvoid accumHatchColor(out vec4 color) {\n  color  =\ttexture2D(hatch0, texCoord) * hatchWeight1.x;\n  color +=\ttexture2D(hatch1, texCoord) * hatchWeight1.y;\n  color +=\ttexture2D(hatch2, texCoord) * hatchWeight1.z;\n  color +=\ttexture2D(hatch3, texCoord) * hatchWeight2.x;\n  color +=\ttexture2D(hatch4, texCoord) * hatchWeight2.y;\n  color +=\ttexture2D(hatch5, texCoord) * hatchWeight2.z;\n}\n\nvoid main(inout vec4 ambient, inout vec4 diffuse, inout vec4 specular) {\n  texCoord = vec2(vTexCoords.x, vTexCoords.y * 0.5);\n  \n//  vec4 color = ambient + diffuse + specular;\n  vec4 color = ambient + diffuse;\n  float all = color.r + color.g + color.b;\n  all = clamp(all, 0.0, 3.0) / 3.0;\n  calcHatchWeights(all * 6.0);\n  accumHatchColor(color);\n  diffuse = color;\n  ambient = specular = vec4(0);\n\n\n  /*\n  calcHatchWeights((ambient.r + ambient.g + ambient.b) / 3.0 * 6.0);\n  accumHatchColor(ambient);\n\n  calcHatchWeights((diffuse.r + diffuse.g + diffuse.b) / 3.0 * 6.0);\n  accumHatchColor(diffuse);\n\n  calcHatchWeights((specular.r + specular.g + specular.b) / 3.0 * 6.0);\n  accumHatchColor(specular);\n  \n  vec4 average = (ambient + diffuse + specular) / 3.0;\n  ambient = average;\n  diffuse = specular = vec4(0);\n  */\n}\n",
  vertex:"shared attribute vec4 VERTEX_POSITION, VERTEX_COLOR;\nshared attribute vec3 VERTEX_NORMAL;\nshared attribute vec2 VERTEX_TEXCOORDS;\n\nvoid main(void) {\n  gl_Position = pMatrix * mvMatrix * VERTEX_POSITION;\n//  vNormal = VERTEX_NORMAL;\n//  vColor = VERTEX_COLOR;\n//  vTexCoords = VERTEX_TEXCOORDS;\n}\n",
exports: {},
name: "hatch"});
Jax.shaders['tamhatch'] = new Jax.Shader({  common:"// Shared variables save on graphics memory and allow you to \"piggy-back\" off of\n// variables defined in other shaders:\n\nshared uniform mat3 nMatrix;\nshared uniform mat4 mvMatrix, pMatrix;\n\nshared varying vec2 vTexCoords;\nshared varying vec3 vNormal;\nshared varying vec4 vBaseColor;\n\nvarying vec4 hatchWeight1;\t// weight for pure white (w), and hatch tecture unit 0, 1, 2\nvarying vec4 hatchWeight2;  // weight for pure black (w), and hatch texture unit 3, 4, 5\nvarying vec2 texCoord;\n\nuniform sampler2D hatch0;\nuniform sampler2D hatch1;\nuniform sampler2D hatch2;\nuniform sampler2D hatch3;\nuniform sampler2D hatch4;\nuniform sampler2D hatch5;\n\nuniform float scaleU, scaleV;\n",
  fragment:"void main(void)\n{\n  vec2 scale = vec2(scaleU, scaleV);\n  if (scaleU == 0.0) scale.x = 1.0;\n  if (scaleV == 0.0) scale.y = 1.0;\n  \n//\tvec2 texCoord = gl_TexCoord[0].xy;\n\n\tvec4 color = vec4(1, 1, 1, 1) * hatchWeight1.w;\n\tcolor     += texture2D(hatch0, texCoord*scale) * hatchWeight1.x;\n\tcolor     += texture2D(hatch1, texCoord*scale) * hatchWeight1.y;\n\tcolor     += texture2D(hatch2, texCoord*scale) * hatchWeight1.z;\n\tcolor     += texture2D(hatch3, texCoord*scale) * hatchWeight2.x;\n\tcolor     += texture2D(hatch4, texCoord*scale) * hatchWeight2.y;\n\tcolor     += texture2D(hatch5, texCoord*scale) * hatchWeight2.z;\n\n\tcolor.a = 1.0;\n\n\tgl_FragColor = color;\n}\n",
  vertex:"          #ifndef dependency_functions_lights\n          #define dependency_functions_lights\n      \n          /* see http://jax.thoughtsincomputation.com/2011/05/webgl-apps-crashing-on-windows-7/ */\n//const struct LightSource {\n//  int enabled;\n//  int type;\n//  vec3 position; // in world space\n//  vec3 direction; // in world space\n//  vec4 ambient, diffuse, specular;\n//  float constant_attenuation, linear_attenuation, quadratic_attenuation;\n//  float spotExponent, spotCosCutoff;\n//};\n\nshared uniform bool LIGHT_ENABLED;\nshared uniform int LIGHT_TYPE;\nshared uniform vec3 LIGHT_POSITION, LIGHT_DIRECTION;\nshared uniform vec4 LIGHT_AMBIENT, LIGHT_DIFFUSE, LIGHT_SPECULAR;\nshared uniform float LIGHT_ATTENUATION_CONSTANT, LIGHT_ATTENUATION_LINEAR, LIGHT_ATTENUATION_QUADRATIC,\n                     LIGHT_SPOT_EXPONENT, LIGHT_SPOT_COS_CUTOFF;\n\nfloat calcAttenuation(in vec3 ecPosition3,\n                      out vec3 lightDirection)\n{\n//  lightDirection = vec3(vnMatrix * -light.position) - ecPosition3;\n  lightDirection = vec3(ivMatrix * vec4(LIGHT_POSITION, 1.0)) - ecPosition3;\n  float d = length(lightDirection);\n  \n  return 1.0 / (LIGHT_ATTENUATION_CONSTANT + LIGHT_ATTENUATION_LINEAR * d + LIGHT_ATTENUATION_QUADRATIC * d * d);\n}\n\nvoid DirectionalLight(in vec3 normal,\n                      inout vec4 ambient,\n                      inout vec4 diffuse,\n                      inout vec4 specular)\n{\n  vec3 nLDir = normalize(vnMatrix * -normalize(LIGHT_DIRECTION));\n  vec3 halfVector = normalize(nLDir + vec3(0,0,1));\n  float pf;\n    \n  float NdotD  = max(0.0, dot(normal, nLDir));\n  float NdotHV = max(0.0, dot(normal, halfVector));\n    \n  if (NdotD == 0.0) pf = 0.0;\n  else pf = pow(NdotHV, materialShininess);\n    \n  ambient += LIGHT_AMBIENT;\n  diffuse += LIGHT_DIFFUSE * NdotD;\n  specular += LIGHT_SPECULAR * pf;\n}\n\n/* Use when attenuation != (1,0,0) */\nvoid PointLightWithAttenuation(in vec3 ecPosition3,\n                               in vec3 normal,\n                               inout vec4 ambient,\n                               inout vec4 diffuse,\n                               inout vec4 specular)\n{\n  float NdotD; // normal . light direction\n  float NdotHV;// normal . half vector\n  float pf;    // specular factor\n  float attenuation;\n  vec3 VP;     // direction from surface to light position\n  vec3 halfVector; // direction of maximum highlights\n  \n  attenuation = calcAttenuation(ecPosition3, VP);\n  VP = normalize(VP);\n  \n  halfVector = normalize(VP+vec3(0,0,1));\n  NdotD = max(0.0, dot(normal, VP));\n  NdotHV= max(0.0, dot(normal, halfVector));\n  \n  if (NdotD == 0.0) pf = 0.0;\n  else pf = pow(NdotHV, materialShininess);\n\n  ambient += LIGHT_AMBIENT * attenuation;\n  diffuse += LIGHT_DIFFUSE * NdotD * attenuation;\n  specular += LIGHT_SPECULAR * pf * attenuation;\n}\n\n/* Use for better performance when attenuation == (1,0,0) */\nvoid PointLightWithoutAttenuation(in vec3 ecPosition3,\n                                  in vec3 normal,\n                                  inout vec4 ambient,\n                                  inout vec4 diffuse,\n                                  inout vec4 specular)\n{\n  float NdotD; // normal . light direction\n  float NdotHV;// normal . half vector\n  float pf;    // specular factor\n  float d;     // distance from surface to light source\n  vec3 VP;     // direction from surface to light position\n  vec3 halfVector; // direction of maximum highlights\n  \n  VP = vec3(ivMatrix * vec4(LIGHT_POSITION, 1.0)) - ecPosition3;\n  d = length(VP);\n  VP = normalize(VP);\n  halfVector = normalize(VP+vec3(0,0,1));\n  NdotD = max(0.0, dot(normal, VP));\n  NdotHV= max(0.0, dot(normal, halfVector));\n  \n  if (NdotD == 0.0) pf = 0.0;\n  else pf = pow(NdotHV, materialShininess);\n  \n  ambient += LIGHT_AMBIENT;\n  diffuse += LIGHT_DIFFUSE * NdotD;\n  specular += LIGHT_SPECULAR * pf;\n}\n\nvoid SpotLight(in vec3 ecPosition3,\n               in vec3 normal,\n               inout vec4 ambient,\n               inout vec4 diffuse,\n               inout vec4 specular)\n{\n  float NdotD; // normal . light direction\n  float NdotHV;// normal . half vector\n  float pf;    // specular factor\n  float attenuation;\n  vec3 VP;     // direction from surface to light position\n  vec3 halfVector; // direction of maximum highlights\n  float spotDot; // cosine of angle between spotlight\n  float spotAttenuation; // spotlight attenuation factor\n  \n  attenuation = calcAttenuation(ecPosition3, VP);\n  VP = normalize(VP);\n  \n  // See if point on surface is inside cone of illumination\n  spotDot = dot(-VP, normalize(vnMatrix*LIGHT_DIRECTION));\n  if (spotDot < LIGHT_SPOT_COS_CUTOFF)\n    spotAttenuation = 0.0;\n  else spotAttenuation = pow(spotDot, LIGHT_SPOT_EXPONENT);\n  \n  attenuation *= spotAttenuation;\n  \n  halfVector = normalize(VP+vec3(0,0,1));\n  NdotD = max(0.0, dot(normal, VP));\n  NdotHV= max(0.0, dot(normal, halfVector));\n  \n  if (NdotD == 0.0) pf = 0.0;\n  else pf = pow(NdotHV, materialShininess);\n  \n  ambient += LIGHT_AMBIENT * attenuation;\n  diffuse += LIGHT_DIFFUSE * NdotD * attenuation;\n  specular += LIGHT_SPECULAR * pf * attenuation;\n}\n\n          #endif\n\n\nshared attribute vec4 VERTEX_POSITION, VERTEX_COLOR;\nshared attribute vec3 VERTEX_NORMAL;\nshared attribute vec2 VERTEX_TEXCOORDS;\n\nvoid main()\n{\n  // zero out values so we don't have undefined vectors all over the place\n  hatchWeight1 = hatchWeight2 = vec4(0);\n  texCoord = vec2(0);\n\n  texCoord = VERTEX_TEXCOORDS;\n  texCoord.t = texCoord.t * 0.5;\n\tgl_Position = pMatrix * mvMatrix * VERTEX_POSITION;\n\t\n\tvec3 normal = normalize(nMatrix * VERTEX_NORMAL);\n\tvec4 vertex = mvMatrix * VERTEX_POSITION;\n  vec3 light;\n  float att = calcAttenuation(vertex.xyz, light);\n  light = normalize(light);\n\t\n\tfloat diffuseValue = max(dot(normal, light), 0.0);// * att;\n\t\n\tfloat hatchLevel = diffuseValue * 6.0;\n\t\n\tif (hatchLevel >= 6.0)\n\t{\n\t\thatchWeight1.x = 1.0;\n\t}\n\telse if (hatchLevel >= 4.0)\n\t{\n\t\thatchWeight1.x = 1.0 - (5.0 - hatchLevel);\n\t\thatchWeight1.y = 1.0 - hatchWeight1.x;\n\t}\n\telse if (hatchLevel >= 3.0)\n\t{\n\t\thatchWeight1.y = 1.0 - (4.0 - hatchLevel);\n\t\thatchWeight1.z = 1.0 - hatchWeight1.y;\n\t}\n\telse if (hatchLevel >= 2.0)\n\t{\n\t\thatchWeight1.z = 1.0 - (3.0 - hatchLevel);\n\t\thatchWeight2.x = 1.0 - hatchWeight1.z;\n\t}\n\telse if (hatchLevel >= 1.0)\n\t{\n\t\thatchWeight2.x = 1.0 - (2.0 - hatchLevel);\n\t\thatchWeight2.y = 1.0 - hatchWeight2.x;\n\t}\n\telse\n\t{\n\t\thatchWeight2.y = 1.0 - (1.0 - hatchLevel);\n\t\thatchWeight2.z = 1.0 - hatchWeight1.y;\n\t}\t\n}\n",
exports: {},
name: "tamhatch"});
Jax.shaders['xhatch'] = new Jax.Shader({  common:"shared uniform mat3 nMatrix;\nshared uniform mat4 mvMatrix, pMatrix;\n\nshared varying vec2 vTexCoords;\nshared varying vec3 vNormal;\nshared varying vec4 vBaseColor;\n\nuniform sampler2D sceneTex;\n\n/* should be uniforms */\nconst float vx_offset = 1.0;\nconst float hatch_y_offset = 5.0;\nconst float lum_threshold_1 = 0.8;\nconst float lum_threshold_2 = 0.65;\nconst float lum_threshold_3 = 0.25;\nconst float lum_threshold_4 = 0.01;\n\nvarying vec3 vPos;\n",
  fragment:"          #ifndef dependency_functions_noise\n          #define dependency_functions_noise\n      \n          /**\n * Classic and 'improved' (simplex) Perlin noise.\n *\n * This implementation attempts to use texture-based lookups if the client\n * hardware can support it. This is no problem in fragment shaders but can\n * be an issue in vertex shaders, where VTL is not supported by about 20%\n * of clients.\n *\n * In the event this is a vertex shader *and* the client doesn't support\n * VTL, the functions will fall back to 'ashima' noise\n * (https://github.com/ashima/webgl-noise) for a slower, non-texture-based\n * implementation.\n **/\n \n<%if (shader_type != 'vertex' || Jax.Shader.max_vertex_textures > 0) {%>\n\n\n/*\n * 2D, 3D and 4D Perlin noise, classic and simplex, in a GLSL fragment shader.\n *\n * Classic noise is implemented by the functions:\n * float cnoise(vec2 P)\n * float cnoise(vec3 P)\n * float cnoise(vec4 P)\n *\n * Simplex noise is implemented by the functions:\n * float snoise(vec2 P)\n * float snoise(vec3 P)\n * float snoise(vec4 P)\n *\n * Author: Stefan Gustavson ITN-LiTH (stegu@itn.liu.se) 2004-12-05\n * You may use, modify and redistribute this code free of charge,\n * provided that my name and this notice appears intact.\n */\n\n/*\n * NOTE: there is a formal problem with the dependent texture lookups.\n * A texture coordinate of exactly 1.0 will wrap to 0.0, so strictly speaking,\n * an error occurs every 256 units of the texture domain, and the same gradient\n * is used for two adjacent noise cells. One solution is to set the texture\n * wrap mode to \"CLAMP\" and do the wrapping explicitly in GLSL with the \"mod\"\n * operator. This could also give you noise with repetition intervals other\n * than 256 without any extra cost.\n * This error is not even noticeable to the eye even if you isolate the exact\n * position in the domain where it occurs and know exactly what to look for.\n * The noise pattern is still visually correct, so I left the bug in there.\n * \n * The value of classic 4D noise goes above 1.0 and below -1.0 at some\n * points. Not much and only very sparsely, but it happens.\n */\n\n\n/*\n * \"permTexture\" is a 256x256 texture that is used for both the permutations\n * and the 2D and 3D gradient lookup. For details, see the main C program.\n * \"simplexTexture\" is a small look-up table to determine a simplex traversal\n * order for 3D and 4D simplex noise. Details are in the C program.\n * \"gradTexture\" is a 256x256 texture with 4D gradients, similar to\n * \"permTexture\" but with the permutation index in the alpha component\n * replaced by the w component of the 4D gradient.\n * 2D classic noise uses only permTexture.\n * 2D simplex noise uses permTexture and simplexTexture.\n * 3D classic noise uses only permTexture.\n * 3D simplex noise uses permTexture and simplexTexture.\n * 4D classic noise uses permTexture and gradTexture.\n * 4D simplex noise uses all three textures.\n */\nuniform sampler2D permTexture;\n// sampler1D not supported in WebGL\n//uniform sampler1D simplexTexture;\nuniform sampler2D simplexTexture;\nuniform sampler2D gradTexture;\n\n/*\n * Both 2D and 3D texture coordinates are defined, for testing purposes.\n */\n//varying vec2 v_texCoord2D;\n//varying vec3 v_texCoord3D;\n//varying vec4 v_color;\n\n/*\n * To create offsets of one texel and one half texel in the\n * texture lookup, we need to know the texture image size.\n */\n#define ONE 0.00390625\n#define ONEHALF 0.001953125\n// The numbers above are 1/256 and 0.5/256, change accordingly\n// if you change the code to use another texture size.\n\n\n/*\n * The interpolation function. This could be a 1D texture lookup\n * to get some more speed, but it's not the main part of the algorithm.\n */\nfloat fade(float t) {\n  // return t*t*(3.0-2.0*t); // Old fade, yields discontinuous second derivative\n  return t*t*t*(t*(t*6.0-15.0)+10.0); // Improved fade, yields C2-continuous noise\n}\n\n\n/*\n * 2D classic Perlin noise. Fast, but less useful than 3D noise.\n */\nfloat cnoise(vec2 P)\n{\n  vec2 Pi = ONE*floor(P)+ONEHALF; // Integer part, scaled and offset for texture lookup\n  vec2 Pf = fract(P);             // Fractional part for interpolation\n\n  // Noise contribution from lower left corner\n  vec2 grad00 = texture2D(permTexture, Pi).rg * 4.0 - 1.0;\n  float n00 = dot(grad00, Pf);\n\n  // Noise contribution from lower right corner\n  vec2 grad10 = texture2D(permTexture, Pi + vec2(ONE, 0.0)).rg * 4.0 - 1.0;\n  float n10 = dot(grad10, Pf - vec2(1.0, 0.0));\n\n  // Noise contribution from upper left corner\n  vec2 grad01 = texture2D(permTexture, Pi + vec2(0.0, ONE)).rg * 4.0 - 1.0;\n  float n01 = dot(grad01, Pf - vec2(0.0, 1.0));\n\n  // Noise contribution from upper right corner\n  vec2 grad11 = texture2D(permTexture, Pi + vec2(ONE, ONE)).rg * 4.0 - 1.0;\n  float n11 = dot(grad11, Pf - vec2(1.0, 1.0));\n\n  // Blend contributions along x\n  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade(Pf.x));\n\n  // Blend contributions along y\n  float n_xy = mix(n_x.x, n_x.y, fade(Pf.y));\n\n  // We're done, return the final noise value.\n  return n_xy;\n}\n\n\n/*\n * 3D classic noise. Slower, but a lot more useful than 2D noise.\n */\nfloat cnoise(vec3 P)\n{\n  vec3 Pi = ONE*floor(P)+ONEHALF; // Integer part, scaled so +1 moves one texel\n                                  // and offset 1/2 texel to sample texel centers\n  vec3 Pf = fract(P);     // Fractional part for interpolation\n\n  // Noise contributions from (x=0, y=0), z=0 and z=1\n  float perm00 = texture2D(permTexture, Pi.xy).a ;\n  vec3  grad000 = texture2D(permTexture, vec2(perm00, Pi.z)).rgb * 4.0 - 1.0;\n  float n000 = dot(grad000, Pf);\n  vec3  grad001 = texture2D(permTexture, vec2(perm00, Pi.z + ONE)).rgb * 4.0 - 1.0;\n  float n001 = dot(grad001, Pf - vec3(0.0, 0.0, 1.0));\n\n  // Noise contributions from (x=0, y=1), z=0 and z=1\n  float perm01 = texture2D(permTexture, Pi.xy + vec2(0.0, ONE)).a ;\n  vec3  grad010 = texture2D(permTexture, vec2(perm01, Pi.z)).rgb * 4.0 - 1.0;\n  float n010 = dot(grad010, Pf - vec3(0.0, 1.0, 0.0));\n  vec3  grad011 = texture2D(permTexture, vec2(perm01, Pi.z + ONE)).rgb * 4.0 - 1.0;\n  float n011 = dot(grad011, Pf - vec3(0.0, 1.0, 1.0));\n\n  // Noise contributions from (x=1, y=0), z=0 and z=1\n  float perm10 = texture2D(permTexture, Pi.xy + vec2(ONE, 0.0)).a ;\n  vec3  grad100 = texture2D(permTexture, vec2(perm10, Pi.z)).rgb * 4.0 - 1.0;\n  float n100 = dot(grad100, Pf - vec3(1.0, 0.0, 0.0));\n  vec3  grad101 = texture2D(permTexture, vec2(perm10, Pi.z + ONE)).rgb * 4.0 - 1.0;\n  float n101 = dot(grad101, Pf - vec3(1.0, 0.0, 1.0));\n\n  // Noise contributions from (x=1, y=1), z=0 and z=1\n  float perm11 = texture2D(permTexture, Pi.xy + vec2(ONE, ONE)).a ;\n  vec3  grad110 = texture2D(permTexture, vec2(perm11, Pi.z)).rgb * 4.0 - 1.0;\n  float n110 = dot(grad110, Pf - vec3(1.0, 1.0, 0.0));\n  vec3  grad111 = texture2D(permTexture, vec2(perm11, Pi.z + ONE)).rgb * 4.0 - 1.0;\n  float n111 = dot(grad111, Pf - vec3(1.0, 1.0, 1.0));\n\n  // Blend contributions along x\n  vec4 n_x = mix(vec4(n000, n001, n010, n011),\n                 vec4(n100, n101, n110, n111), fade(Pf.x));\n\n  // Blend contributions along y\n  vec2 n_xy = mix(n_x.xy, n_x.zw, fade(Pf.y));\n\n  // Blend contributions along z\n  float n_xyz = mix(n_xy.x, n_xy.y, fade(Pf.z));\n\n  // We're done, return the final noise value.\n  return n_xyz;\n}\n\n\n/*\n * 4D classic noise. Slow, but very useful. 4D simplex noise is a lot faster.\n *\n * This function performs 8 texture lookups and 16 dependent texture lookups,\n * 16 dot products, 4 mix operations and a lot of additions and multiplications.\n * Needless to say, it's not super fast. But it's not dead slow either.\n */\nfloat cnoise(vec4 P)\n{\n  vec4 Pi = ONE*floor(P)+ONEHALF; // Integer part, scaled so +1 moves one texel\n                                  // and offset 1/2 texel to sample texel centers\n  vec4 Pf = fract(P);      // Fractional part for interpolation\n\n  // \"n0000\" is the noise contribution from (x=0, y=0, z=0, w=0), and so on\n  float perm00xy = texture2D(permTexture, Pi.xy).a ;\n  float perm00zw = texture2D(permTexture, Pi.zw).a ;\n  vec4 grad0000 = texture2D(gradTexture, vec2(perm00xy, perm00zw)).rgba * 4.0 -1.0;\n  float n0000 = dot(grad0000, Pf);\n\n  float perm01zw = texture2D(permTexture, Pi.zw  + vec2(0.0, ONE)).a ;\n  vec4  grad0001 = texture2D(gradTexture, vec2(perm00xy, perm01zw)).rgba * 4.0 - 1.0;\n  float n0001 = dot(grad0001, Pf - vec4(0.0, 0.0, 0.0, 1.0));\n\n  float perm10zw = texture2D(permTexture, Pi.zw  + vec2(ONE, 0.0)).a ;\n  vec4  grad0010 = texture2D(gradTexture, vec2(perm00xy, perm10zw)).rgba * 4.0 - 1.0;\n  float n0010 = dot(grad0010, Pf - vec4(0.0, 0.0, 1.0, 0.0));\n\n  float perm11zw = texture2D(permTexture, Pi.zw  + vec2(ONE, ONE)).a ;\n  vec4  grad0011 = texture2D(gradTexture, vec2(perm00xy, perm11zw)).rgba * 4.0 - 1.0;\n  float n0011 = dot(grad0011, Pf - vec4(0.0, 0.0, 1.0, 1.0));\n\n  float perm01xy = texture2D(permTexture, Pi.xy + vec2(0.0, ONE)).a ;\n  vec4  grad0100 = texture2D(gradTexture, vec2(perm01xy, perm00zw)).rgba * 4.0 - 1.0;\n  float n0100 = dot(grad0100, Pf - vec4(0.0, 1.0, 0.0, 0.0));\n\n  vec4  grad0101 = texture2D(gradTexture, vec2(perm01xy, perm01zw)).rgba * 4.0 - 1.0;\n  float n0101 = dot(grad0101, Pf - vec4(0.0, 1.0, 0.0, 1.0));\n\n  vec4  grad0110 = texture2D(gradTexture, vec2(perm01xy, perm10zw)).rgba * 4.0 - 1.0;\n  float n0110 = dot(grad0110, Pf - vec4(0.0, 1.0, 1.0, 0.0));\n\n  vec4  grad0111 = texture2D(gradTexture, vec2(perm01xy, perm11zw)).rgba * 4.0 - 1.0;\n  float n0111 = dot(grad0111, Pf - vec4(0.0, 1.0, 1.0, 1.0));\n\n  float perm10xy = texture2D(permTexture, Pi.xy + vec2(ONE, 0.0)).a ;\n  vec4  grad1000 = texture2D(gradTexture, vec2(perm10xy, perm00zw)).rgba * 4.0 - 1.0;\n  float n1000 = dot(grad1000, Pf - vec4(1.0, 0.0, 0.0, 0.0));\n\n  vec4  grad1001 = texture2D(gradTexture, vec2(perm10xy, perm01zw)).rgba * 4.0 - 1.0;\n  float n1001 = dot(grad1001, Pf - vec4(1.0, 0.0, 0.0, 1.0));\n\n  vec4  grad1010 = texture2D(gradTexture, vec2(perm10xy, perm10zw)).rgba * 4.0 - 1.0;\n  float n1010 = dot(grad1010, Pf - vec4(1.0, 0.0, 1.0, 0.0));\n\n  vec4  grad1011 = texture2D(gradTexture, vec2(perm10xy, perm11zw)).rgba * 4.0 - 1.0;\n  float n1011 = dot(grad1011, Pf - vec4(1.0, 0.0, 1.0, 1.0));\n\n  float perm11xy = texture2D(permTexture, Pi.xy + vec2(ONE, ONE)).a ;\n  vec4  grad1100 = texture2D(gradTexture, vec2(perm11xy, perm00zw)).rgba * 4.0 - 1.0;\n  float n1100 = dot(grad1100, Pf - vec4(1.0, 1.0, 0.0, 0.0));\n\n  vec4  grad1101 = texture2D(gradTexture, vec2(perm11xy, perm01zw)).rgba * 4.0 - 1.0;\n  float n1101 = dot(grad1101, Pf - vec4(1.0, 1.0, 0.0, 1.0));\n\n  vec4  grad1110 = texture2D(gradTexture, vec2(perm11xy, perm10zw)).rgba * 4.0 - 1.0;\n  float n1110 = dot(grad1110, Pf - vec4(1.0, 1.0, 1.0, 0.0));\n\n  vec4  grad1111 = texture2D(gradTexture, vec2(perm11xy, perm11zw)).rgba * 4.0 - 1.0;\n  float n1111 = dot(grad1111, Pf - vec4(1.0, 1.0, 1.0, 1.0));\n\n  // Blend contributions along x\n  float fadex = fade(Pf.x);\n  vec4 n_x0 = mix(vec4(n0000, n0001, n0010, n0011),\n                  vec4(n1000, n1001, n1010, n1011), fadex);\n  vec4 n_x1 = mix(vec4(n0100, n0101, n0110, n0111),\n                  vec4(n1100, n1101, n1110, n1111), fadex);\n\n  // Blend contributions along y\n  vec4 n_xy = mix(n_x0, n_x1, fade(Pf.y));\n\n  // Blend contributions along z\n  vec2 n_xyz = mix(n_xy.xy, n_xy.zw, fade(Pf.z));\n\n  // Blend contributions along w\n  float n_xyzw = mix(n_xyz.x, n_xyz.y, fade(Pf.w));\n\n  // We're done, return the final noise value.\n  return n_xyzw;\n}\n\n\n/*\n * 2D simplex noise. Somewhat slower but much better looking than classic noise.\n */\nfloat snoise(vec2 P) {\n\n// Skew and unskew factors are a bit hairy for 2D, so define them as constants\n// This is (sqrt(3.0)-1.0)/2.0\n#define F2 0.366025403784\n// This is (3.0-sqrt(3.0))/6.0\n#define G2 0.211324865405\n\n  // Skew the (x,y) space to determine which cell of 2 simplices we're in\n \tfloat s = (P.x + P.y) * F2;   // Hairy factor for 2D skewing\n  vec2 Pi = floor(P + s);\n  float t = (Pi.x + Pi.y) * G2; // Hairy factor for unskewing\n  vec2 P0 = Pi - t; // Unskew the cell origin back to (x,y) space\n  Pi = Pi * ONE + ONEHALF; // Integer part, scaled and offset for texture lookup\n\n  vec2 Pf0 = P - P0;  // The x,y distances from the cell origin\n\n  // For the 2D case, the simplex shape is an equilateral triangle.\n  // Find out whether we are above or below the x=y diagonal to\n  // determine which of the two triangles we're in.\n  vec2 o1;\n  if(Pf0.x > Pf0.y) o1 = vec2(1.0, 0.0);  // +x, +y traversal order\n  else o1 = vec2(0.0, 1.0);               // +y, +x traversal order\n\n  // Noise contribution from simplex origin\n  vec2 grad0 = texture2D(permTexture, Pi).rg * 4.0 - 1.0;\n  float t0 = 0.5 - dot(Pf0, Pf0);\n  float n0;\n  if (t0 < 0.0) n0 = 0.0;\n  else {\n    t0 *= t0;\n    n0 = t0 * t0 * dot(grad0, Pf0);\n  }\n\n  // Noise contribution from middle corner\n  vec2 Pf1 = Pf0 - o1 + G2;\n  vec2 grad1 = texture2D(permTexture, Pi + o1*ONE).rg * 4.0 - 1.0;\n  float t1 = 0.5 - dot(Pf1, Pf1);\n  float n1;\n  if (t1 < 0.0) n1 = 0.0;\n  else {\n    t1 *= t1;\n    n1 = t1 * t1 * dot(grad1, Pf1);\n  }\n  \n  // Noise contribution from last corner\n  vec2 Pf2 = Pf0 - vec2(1.0-2.0*G2);\n  vec2 grad2 = texture2D(permTexture, Pi + vec2(ONE, ONE)).rg * 4.0 - 1.0;\n  float t2 = 0.5 - dot(Pf2, Pf2);\n  float n2;\n  if(t2 < 0.0) n2 = 0.0;\n  else {\n    t2 *= t2;\n    n2 = t2 * t2 * dot(grad2, Pf2);\n  }\n\n  // Sum up and scale the result to cover the range [-1,1]\n  return 70.0 * (n0 + n1 + n2);\n}\n\n\n/*\n * 3D simplex noise. Comparable in speed to classic noise, better looking.\n */\nfloat snoise(vec3 P) {\n\n// The skewing and unskewing factors are much simpler for the 3D case\n#define F3 0.333333333333\n#define G3 0.166666666667\n\n  // Skew the (x,y,z) space to determine which cell of 6 simplices we're in\n \tfloat s = (P.x + P.y + P.z) * F3; // Factor for 3D skewing\n  vec3 Pi = floor(P + s);\n  float t = (Pi.x + Pi.y + Pi.z) * G3;\n  vec3 P0 = Pi - t; // Unskew the cell origin back to (x,y,z) space\n  Pi = Pi * ONE + ONEHALF; // Integer part, scaled and offset for texture lookup\n\n  vec3 Pf0 = P - P0;  // The x,y distances from the cell origin\n\n  // For the 3D case, the simplex shape is a slightly irregular tetrahedron.\n  // To find out which of the six possible tetrahedra we're in, we need to\n  // determine the magnitude ordering of x, y and z components of Pf0.\n  // The method below is explained briefly in the C code. It uses a small\n  // 1D texture as a lookup table. The table is designed to work for both\n  // 3D and 4D noise, so only 8 (only 6, actually) of the 64 indices are\n  // used here.\n  float c1 = (Pf0.x > Pf0.y) ? 0.5078125 : 0.0078125; // 1/2 + 1/128\n  float c2 = (Pf0.x > Pf0.z) ? 0.25 : 0.0;\n  float c3 = (Pf0.y > Pf0.z) ? 0.125 : 0.0;\n  float sindex = c1 + c2 + c3;\n  vec3 offsets = texture2D(simplexTexture, vec2(sindex, 0.0)).rgb;\n//  vec3 offsets = texture1D(simplexTexture, sindex).rgb;\n  vec3 o1 = step(0.375, offsets);\n  vec3 o2 = step(0.125, offsets);\n\n  // Noise contribution from simplex origin\n  float perm0 = texture2D(permTexture, Pi.xy).a;\n  vec3  grad0 = texture2D(permTexture, vec2(perm0, Pi.z)).rgb * 4.0 - 1.0;\n  float t0 = 0.6 - dot(Pf0, Pf0);\n  float n0;\n  if (t0 < 0.0) n0 = 0.0;\n  else {\n    t0 *= t0;\n    n0 = t0 * t0 * dot(grad0, Pf0);\n  }\n\n  // Noise contribution from second corner\n  vec3 Pf1 = Pf0 - o1 + G3;\n  float perm1 = texture2D(permTexture, Pi.xy + o1.xy*ONE).a;\n  vec3  grad1 = texture2D(permTexture, vec2(perm1, Pi.z + o1.z*ONE)).rgb * 4.0 - 1.0;\n  float t1 = 0.6 - dot(Pf1, Pf1);\n  float n1;\n  if (t1 < 0.0) n1 = 0.0;\n  else {\n    t1 *= t1;\n    n1 = t1 * t1 * dot(grad1, Pf1);\n  }\n  \n  // Noise contribution from third corner\n  vec3 Pf2 = Pf0 - o2 + 2.0 * G3;\n  float perm2 = texture2D(permTexture, Pi.xy + o2.xy*ONE).a;\n  vec3  grad2 = texture2D(permTexture, vec2(perm2, Pi.z + o2.z*ONE)).rgb * 4.0 - 1.0;\n  float t2 = 0.6 - dot(Pf2, Pf2);\n  float n2;\n  if (t2 < 0.0) n2 = 0.0;\n  else {\n    t2 *= t2;\n    n2 = t2 * t2 * dot(grad2, Pf2);\n  }\n  \n  // Noise contribution from last corner\n  vec3 Pf3 = Pf0 - vec3(1.0-3.0*G3);\n  float perm3 = texture2D(permTexture, Pi.xy + vec2(ONE, ONE)).a;\n  vec3  grad3 = texture2D(permTexture, vec2(perm3, Pi.z + ONE)).rgb * 4.0 - 1.0;\n  float t3 = 0.6 - dot(Pf3, Pf3);\n  float n3;\n  if(t3 < 0.0) n3 = 0.0;\n  else {\n    t3 *= t3;\n    n3 = t3 * t3 * dot(grad3, Pf3);\n  }\n\n  // Sum up and scale the result to cover the range [-1,1]\n  return 32.0 * (n0 + n1 + n2 + n3);\n}\n\n\n/*\n * 4D simplex noise. A lot faster than classic 4D noise, and better looking.\n */\n\nfloat snoise(vec4 P) {\n\n// The skewing and unskewing factors are hairy again for the 4D case\n// This is (sqrt(5.0)-1.0)/4.0\n#define F4 0.309016994375\n// This is (5.0-sqrt(5.0))/20.0\n#define G4 0.138196601125\n\n  // Skew the (x,y,z,w) space to determine which cell of 24 simplices we're in\n \tfloat s = (P.x + P.y + P.z + P.w) * F4; // Factor for 4D skewing\n  vec4 Pi = floor(P + s);\n  float t = (Pi.x + Pi.y + Pi.z + Pi.w) * G4;\n  vec4 P0 = Pi - t; // Unskew the cell origin back to (x,y,z,w) space\n  Pi = Pi * ONE + ONEHALF; // Integer part, scaled and offset for texture lookup\n\n  vec4 Pf0 = P - P0;  // The x,y distances from the cell origin\n\n  // For the 4D case, the simplex is a 4D shape I won't even try to describe.\n  // To find out which of the 24 possible simplices we're in, we need to\n  // determine the magnitude ordering of x, y, z and w components of Pf0.\n  // The method below is presented without explanation. It uses a small 1D\n  // texture as a lookup table. The table is designed to work for both\n  // 3D and 4D noise and contains 64 indices, of which only 24 are actually\n  // used. An extension to 5D would require a larger texture here.\n  float c1 = (Pf0.x > Pf0.y) ? 0.5078125 : 0.0078125; // 1/2 + 1/128\n  float c2 = (Pf0.x > Pf0.z) ? 0.25 : 0.0;\n  float c3 = (Pf0.y > Pf0.z) ? 0.125 : 0.0;\n  float c4 = (Pf0.x > Pf0.w) ? 0.0625 : 0.0;\n  float c5 = (Pf0.y > Pf0.w) ? 0.03125 : 0.0;\n  float c6 = (Pf0.z > Pf0.w) ? 0.015625 : 0.0;\n  float sindex = c1 + c2 + c3 + c4 + c5 + c6;\n  vec4 offsets = texture2D(simplexTexture, vec2(sindex, 0.0)).rgba;\n//  vec4 offsets = texture1D(simplexTexture, sindex).rgba;\n  vec4 o1 = step(0.625, offsets);\n  vec4 o2 = step(0.375, offsets);\n  vec4 o3 = step(0.125, offsets);\n\n  // Noise contribution from simplex origin\n  float perm0xy = texture2D(permTexture, Pi.xy).a;\n  float perm0zw = texture2D(permTexture, Pi.zw).a;\n  vec4  grad0 = texture2D(gradTexture, vec2(perm0xy, perm0zw)).rgba * 4.0 - 1.0;\n  float t0 = 0.6 - dot(Pf0, Pf0);\n  float n0;\n  if (t0 < 0.0) n0 = 0.0;\n  else {\n    t0 *= t0;\n    n0 = t0 * t0 * dot(grad0, Pf0);\n  }\n\n  // Noise contribution from second corner\n  vec4 Pf1 = Pf0 - o1 + G4;\n  o1 = o1 * ONE;\n  float perm1xy = texture2D(permTexture, Pi.xy + o1.xy).a;\n  float perm1zw = texture2D(permTexture, Pi.zw + o1.zw).a;\n  vec4  grad1 = texture2D(gradTexture, vec2(perm1xy, perm1zw)).rgba * 4.0 - 1.0;\n  float t1 = 0.6 - dot(Pf1, Pf1);\n  float n1;\n  if (t1 < 0.0) n1 = 0.0;\n  else {\n    t1 *= t1;\n    n1 = t1 * t1 * dot(grad1, Pf1);\n  }\n  \n  // Noise contribution from third corner\n  vec4 Pf2 = Pf0 - o2 + 2.0 * G4;\n  o2 = o2 * ONE;\n  float perm2xy = texture2D(permTexture, Pi.xy + o2.xy).a;\n  float perm2zw = texture2D(permTexture, Pi.zw + o2.zw).a;\n  vec4  grad2 = texture2D(gradTexture, vec2(perm2xy, perm2zw)).rgba * 4.0 - 1.0;\n  float t2 = 0.6 - dot(Pf2, Pf2);\n  float n2;\n  if (t2 < 0.0) n2 = 0.0;\n  else {\n    t2 *= t2;\n    n2 = t2 * t2 * dot(grad2, Pf2);\n  }\n  \n  // Noise contribution from fourth corner\n  vec4 Pf3 = Pf0 - o3 + 3.0 * G4;\n  o3 = o3 * ONE;\n  float perm3xy = texture2D(permTexture, Pi.xy + o3.xy).a;\n  float perm3zw = texture2D(permTexture, Pi.zw + o3.zw).a;\n  vec4  grad3 = texture2D(gradTexture, vec2(perm3xy, perm3zw)).rgba * 4.0 - 1.0;\n  float t3 = 0.6 - dot(Pf3, Pf3);\n  float n3;\n  if (t3 < 0.0) n3 = 0.0;\n  else {\n    t3 *= t3;\n    n3 = t3 * t3 * dot(grad3, Pf3);\n  }\n  \n  // Noise contribution from last corner\n  vec4 Pf4 = Pf0 - vec4(1.0-4.0*G4);\n  float perm4xy = texture2D(permTexture, Pi.xy + vec2(ONE, ONE)).a;\n  float perm4zw = texture2D(permTexture, Pi.zw + vec2(ONE, ONE)).a;\n  vec4  grad4 = texture2D(gradTexture, vec2(perm4xy, perm4zw)).rgba * 4.0 - 1.0;\n  float t4 = 0.6 - dot(Pf4, Pf4);\n  float n4;\n  if(t4 < 0.0) n4 = 0.0;\n  else {\n    t4 *= t4;\n    n4 = t4 * t4 * dot(grad4, Pf4);\n  }\n\n  // Sum up and scale the result to cover the range [-1,1]\n  return 27.0 * (n0 + n1 + n2 + n3 + n4);\n}\n\n<%\n} else {\n// non-texture-based implementation:\n// Ian McEwan, Ashima Arts.\n// Copyright (C) 2011 Ashima Arts. All rights reserved.\n// Distributed under the MIT License. See LICENSE file.\n%>\n\nvec4 permute(vec4 x)\n{\n  return mod(((x*34.0)+1.0)*x, 289.0);\n}\n\nvec3 permute(vec3 x)\n{\n  return mod(((x*34.0)+1.0)*x, 289.0);\n}\n\nfloat permute(float x)\n{\n  return floor(mod(((x*34.0)+1.0)*x, 289.0));\n}\n\nvec4 taylorInvSqrt(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat taylorInvSqrt(float r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nvec4 grad4(float j, vec4 ip)\n{\n  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);\n  vec4 p,s;\n\n  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;\n  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);\n  s = vec4(lessThan(p, vec4(0.0)));\n  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;\n\n  return p;\n}\n\nvec4 fade(vec4 t) {\n  return t*t*t*(t*(t*6.0-15.0)+10.0);\n}\n\nvec3 fade(vec3 t) {\n  return t*t*t*(t*(t*6.0-15.0)+10.0);\n}\n\nvec2 fade(vec2 t) {\n  return t*t*t*(t*(t*6.0-15.0)+10.0);\n}\n\n// Classic Perlin noise\nfloat cnoise(vec2 P)\n{\n  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);\n  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);\n  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation\n  vec4 ix = Pi.xzxz;\n  vec4 iy = Pi.yyww;\n  vec4 fx = Pf.xzxz;\n  vec4 fy = Pf.yyww;\n\n  vec4 i = permute(permute(ix) + iy);\n\n  vec4 gx = 2.0 * fract(i / 41.0) - 1.0 ;\n  vec4 gy = abs(gx) - 0.5 ;\n  vec4 tx = floor(gx + 0.5);\n  gx = gx - tx;\n\n  vec2 g00 = vec2(gx.x,gy.x);\n  vec2 g10 = vec2(gx.y,gy.y);\n  vec2 g01 = vec2(gx.z,gy.z);\n  vec2 g11 = vec2(gx.w,gy.w);\n\n  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));\n  g00 *= norm.x;\n  g01 *= norm.y;\n  g10 *= norm.z;\n  g11 *= norm.w;\n\n  float n00 = dot(g00, vec2(fx.x, fy.x));\n  float n10 = dot(g10, vec2(fx.y, fy.y));\n  float n01 = dot(g01, vec2(fx.z, fy.z));\n  float n11 = dot(g11, vec2(fx.w, fy.w));\n\n  vec2 fade_xy = fade(Pf.xy);\n  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);\n  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);\n  return 2.3 * n_xy;\n}\n\n// Classic Perlin noise, periodic variant\nfloat pnoise(vec2 P, vec2 rep)\n{\n  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);\n  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);\n  Pi = mod(Pi, rep.xyxy); // To create noise with explicit period\n  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation\n  vec4 ix = Pi.xzxz;\n  vec4 iy = Pi.yyww;\n  vec4 fx = Pf.xzxz;\n  vec4 fy = Pf.yyww;\n\n  vec4 i = permute(permute(ix) + iy);\n\n  vec4 gx = 2.0 * fract(i / 41.0) - 1.0 ;\n  vec4 gy = abs(gx) - 0.5 ;\n  vec4 tx = floor(gx + 0.5);\n  gx = gx - tx;\n\n  vec2 g00 = vec2(gx.x,gy.x);\n  vec2 g10 = vec2(gx.y,gy.y);\n  vec2 g01 = vec2(gx.z,gy.z);\n  vec2 g11 = vec2(gx.w,gy.w);\n\n  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));\n  g00 *= norm.x;\n  g01 *= norm.y;\n  g10 *= norm.z;\n  g11 *= norm.w;\n\n  float n00 = dot(g00, vec2(fx.x, fy.x));\n  float n10 = dot(g10, vec2(fx.y, fy.y));\n  float n01 = dot(g01, vec2(fx.z, fy.z));\n  float n11 = dot(g11, vec2(fx.w, fy.w));\n\n  vec2 fade_xy = fade(Pf.xy);\n  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);\n  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);\n  return 2.3 * n_xy;\n}\n\n// Classic Perlin noise\nfloat cnoise(vec3 P)\n{\n  vec3 Pi0 = floor(P); // Integer part for indexing\n  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1\n  Pi0 = mod(Pi0, 289.0);\n  Pi1 = mod(Pi1, 289.0);\n  vec3 Pf0 = fract(P); // Fractional part for interpolation\n  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0\n  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n  vec4 iy = vec4(Pi0.yy, Pi1.yy);\n  vec4 iz0 = Pi0.zzzz;\n  vec4 iz1 = Pi1.zzzz;\n\n  vec4 ixy = permute(permute(ix) + iy);\n  vec4 ixy0 = permute(ixy + iz0);\n  vec4 ixy1 = permute(ixy + iz1);\n\n  vec4 gx0 = ixy0 / 7.0;\n  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;\n  gx0 = fract(gx0);\n  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);\n  vec4 sz0 = step(gz0, vec4(0.0));\n  gx0 -= sz0 * (step(0.0, gx0) - 0.5);\n  gy0 -= sz0 * (step(0.0, gy0) - 0.5);\n\n  vec4 gx1 = ixy1 / 7.0;\n  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;\n  gx1 = fract(gx1);\n  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);\n  vec4 sz1 = step(gz1, vec4(0.0));\n  gx1 -= sz1 * (step(0.0, gx1) - 0.5);\n  gy1 -= sz1 * (step(0.0, gy1) - 0.5);\n\n  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);\n  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);\n  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);\n  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);\n  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);\n  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);\n  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);\n  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);\n\n  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\n  g000 *= norm0.x;\n  g010 *= norm0.y;\n  g100 *= norm0.z;\n  g110 *= norm0.w;\n  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\n  g001 *= norm1.x;\n  g011 *= norm1.y;\n  g101 *= norm1.z;\n  g111 *= norm1.w;\n\n  float n000 = dot(g000, Pf0);\n  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));\n  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));\n  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));\n  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));\n  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));\n  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));\n  float n111 = dot(g111, Pf1);\n\n  vec3 fade_xyz = fade(Pf0);\n  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);\n  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);\n  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);\n  return 2.2 * n_xyz;\n}\n\n// Classic Perlin noise, periodic variant\nfloat pnoise(vec3 P, vec3 rep)\n{\n  vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period\n  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period\n  Pi0 = mod(Pi0, 289.0);\n  Pi1 = mod(Pi1, 289.0);\n  vec3 Pf0 = fract(P); // Fractional part for interpolation\n  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0\n  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n  vec4 iy = vec4(Pi0.yy, Pi1.yy);\n  vec4 iz0 = Pi0.zzzz;\n  vec4 iz1 = Pi1.zzzz;\n\n  vec4 ixy = permute(permute(ix) + iy);\n  vec4 ixy0 = permute(ixy + iz0);\n  vec4 ixy1 = permute(ixy + iz1);\n\n  vec4 gx0 = ixy0 / 7.0;\n  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;\n  gx0 = fract(gx0);\n  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);\n  vec4 sz0 = step(gz0, vec4(0.0));\n  gx0 -= sz0 * (step(0.0, gx0) - 0.5);\n  gy0 -= sz0 * (step(0.0, gy0) - 0.5);\n\n  vec4 gx1 = ixy1 / 7.0;\n  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;\n  gx1 = fract(gx1);\n  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);\n  vec4 sz1 = step(gz1, vec4(0.0));\n  gx1 -= sz1 * (step(0.0, gx1) - 0.5);\n  gy1 -= sz1 * (step(0.0, gy1) - 0.5);\n\n  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);\n  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);\n  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);\n  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);\n  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);\n  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);\n  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);\n  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);\n\n  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\n  g000 *= norm0.x;\n  g010 *= norm0.y;\n  g100 *= norm0.z;\n  g110 *= norm0.w;\n  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\n  g001 *= norm1.x;\n  g011 *= norm1.y;\n  g101 *= norm1.z;\n  g111 *= norm1.w;\n\n  float n000 = dot(g000, Pf0);\n  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));\n  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));\n  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));\n  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));\n  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));\n  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));\n  float n111 = dot(g111, Pf1);\n\n  vec3 fade_xyz = fade(Pf0);\n  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);\n  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);\n  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);\n  return 2.2 * n_xyz;\n}\n\n// Classic Perlin noise\nfloat cnoise(vec4 P)\n{\n  vec4 Pi0 = floor(P); // Integer part for indexing\n  vec4 Pi1 = Pi0 + 1.0; // Integer part + 1\n  Pi0 = mod(Pi0, 289.0);\n  Pi1 = mod(Pi1, 289.0);\n  vec4 Pf0 = fract(P); // Fractional part for interpolation\n  vec4 Pf1 = Pf0 - 1.0; // Fractional part - 1.0\n  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n  vec4 iy = vec4(Pi0.yy, Pi1.yy);\n  vec4 iz0 = vec4(Pi0.zzzz);\n  vec4 iz1 = vec4(Pi1.zzzz);\n  vec4 iw0 = vec4(Pi0.wwww);\n  vec4 iw1 = vec4(Pi1.wwww);\n\n  vec4 ixy = permute(permute(ix) + iy);\n  vec4 ixy0 = permute(ixy + iz0);\n  vec4 ixy1 = permute(ixy + iz1);\n  vec4 ixy00 = permute(ixy0 + iw0);\n  vec4 ixy01 = permute(ixy0 + iw1);\n  vec4 ixy10 = permute(ixy1 + iw0);\n  vec4 ixy11 = permute(ixy1 + iw1);\n\n  vec4 gx00 = ixy00 / 7.0;\n  vec4 gy00 = floor(gx00) / 7.0;\n  vec4 gz00 = floor(gy00) / 6.0;\n  gx00 = fract(gx00) - 0.5;\n  gy00 = fract(gy00) - 0.5;\n  gz00 = fract(gz00) - 0.5;\n  vec4 gw00 = vec4(0.75) - abs(gx00) - abs(gy00) - abs(gz00);\n  vec4 sw00 = step(gw00, vec4(0.0));\n  gx00 -= sw00 * (step(0.0, gx00) - 0.5);\n  gy00 -= sw00 * (step(0.0, gy00) - 0.5);\n\n  vec4 gx01 = ixy01 / 7.0;\n  vec4 gy01 = floor(gx01) / 7.0;\n  vec4 gz01 = floor(gy01) / 6.0;\n  gx01 = fract(gx01) - 0.5;\n  gy01 = fract(gy01) - 0.5;\n  gz01 = fract(gz01) - 0.5;\n  vec4 gw01 = vec4(0.75) - abs(gx01) - abs(gy01) - abs(gz01);\n  vec4 sw01 = step(gw01, vec4(0.0));\n  gx01 -= sw01 * (step(0.0, gx01) - 0.5);\n  gy01 -= sw01 * (step(0.0, gy01) - 0.5);\n\n  vec4 gx10 = ixy10 / 7.0;\n  vec4 gy10 = floor(gx10) / 7.0;\n  vec4 gz10 = floor(gy10) / 6.0;\n  gx10 = fract(gx10) - 0.5;\n  gy10 = fract(gy10) - 0.5;\n  gz10 = fract(gz10) - 0.5;\n  vec4 gw10 = vec4(0.75) - abs(gx10) - abs(gy10) - abs(gz10);\n  vec4 sw10 = step(gw10, vec4(0.0));\n  gx10 -= sw10 * (step(0.0, gx10) - 0.5);\n  gy10 -= sw10 * (step(0.0, gy10) - 0.5);\n\n  vec4 gx11 = ixy11 / 7.0;\n  vec4 gy11 = floor(gx11) / 7.0;\n  vec4 gz11 = floor(gy11) / 6.0;\n  gx11 = fract(gx11) - 0.5;\n  gy11 = fract(gy11) - 0.5;\n  gz11 = fract(gz11) - 0.5;\n  vec4 gw11 = vec4(0.75) - abs(gx11) - abs(gy11) - abs(gz11);\n  vec4 sw11 = step(gw11, vec4(0.0));\n  gx11 -= sw11 * (step(0.0, gx11) - 0.5);\n  gy11 -= sw11 * (step(0.0, gy11) - 0.5);\n\n  vec4 g0000 = vec4(gx00.x,gy00.x,gz00.x,gw00.x);\n  vec4 g1000 = vec4(gx00.y,gy00.y,gz00.y,gw00.y);\n  vec4 g0100 = vec4(gx00.z,gy00.z,gz00.z,gw00.z);\n  vec4 g1100 = vec4(gx00.w,gy00.w,gz00.w,gw00.w);\n  vec4 g0010 = vec4(gx10.x,gy10.x,gz10.x,gw10.x);\n  vec4 g1010 = vec4(gx10.y,gy10.y,gz10.y,gw10.y);\n  vec4 g0110 = vec4(gx10.z,gy10.z,gz10.z,gw10.z);\n  vec4 g1110 = vec4(gx10.w,gy10.w,gz10.w,gw10.w);\n  vec4 g0001 = vec4(gx01.x,gy01.x,gz01.x,gw01.x);\n  vec4 g1001 = vec4(gx01.y,gy01.y,gz01.y,gw01.y);\n  vec4 g0101 = vec4(gx01.z,gy01.z,gz01.z,gw01.z);\n  vec4 g1101 = vec4(gx01.w,gy01.w,gz01.w,gw01.w);\n  vec4 g0011 = vec4(gx11.x,gy11.x,gz11.x,gw11.x);\n  vec4 g1011 = vec4(gx11.y,gy11.y,gz11.y,gw11.y);\n  vec4 g0111 = vec4(gx11.z,gy11.z,gz11.z,gw11.z);\n  vec4 g1111 = vec4(gx11.w,gy11.w,gz11.w,gw11.w);\n\n  vec4 norm00 = taylorInvSqrt(vec4(dot(g0000, g0000), dot(g0100, g0100), dot(g1000, g1000), dot(g1100, g1100)));\n  g0000 *= norm00.x;\n  g0100 *= norm00.y;\n  g1000 *= norm00.z;\n  g1100 *= norm00.w;\n\n  vec4 norm01 = taylorInvSqrt(vec4(dot(g0001, g0001), dot(g0101, g0101), dot(g1001, g1001), dot(g1101, g1101)));\n  g0001 *= norm01.x;\n  g0101 *= norm01.y;\n  g1001 *= norm01.z;\n  g1101 *= norm01.w;\n\n  vec4 norm10 = taylorInvSqrt(vec4(dot(g0010, g0010), dot(g0110, g0110), dot(g1010, g1010), dot(g1110, g1110)));\n  g0010 *= norm10.x;\n  g0110 *= norm10.y;\n  g1010 *= norm10.z;\n  g1110 *= norm10.w;\n\n  vec4 norm11 = taylorInvSqrt(vec4(dot(g0011, g0011), dot(g0111, g0111), dot(g1011, g1011), dot(g1111, g1111)));\n  g0011 *= norm11.x;\n  g0111 *= norm11.y;\n  g1011 *= norm11.z;\n  g1111 *= norm11.w;\n\n  float n0000 = dot(g0000, Pf0);\n  float n1000 = dot(g1000, vec4(Pf1.x, Pf0.yzw));\n  float n0100 = dot(g0100, vec4(Pf0.x, Pf1.y, Pf0.zw));\n  float n1100 = dot(g1100, vec4(Pf1.xy, Pf0.zw));\n  float n0010 = dot(g0010, vec4(Pf0.xy, Pf1.z, Pf0.w));\n  float n1010 = dot(g1010, vec4(Pf1.x, Pf0.y, Pf1.z, Pf0.w));\n  float n0110 = dot(g0110, vec4(Pf0.x, Pf1.yz, Pf0.w));\n  float n1110 = dot(g1110, vec4(Pf1.xyz, Pf0.w));\n  float n0001 = dot(g0001, vec4(Pf0.xyz, Pf1.w));\n  float n1001 = dot(g1001, vec4(Pf1.x, Pf0.yz, Pf1.w));\n  float n0101 = dot(g0101, vec4(Pf0.x, Pf1.y, Pf0.z, Pf1.w));\n  float n1101 = dot(g1101, vec4(Pf1.xy, Pf0.z, Pf1.w));\n  float n0011 = dot(g0011, vec4(Pf0.xy, Pf1.zw));\n  float n1011 = dot(g1011, vec4(Pf1.x, Pf0.y, Pf1.zw));\n  float n0111 = dot(g0111, vec4(Pf0.x, Pf1.yzw));\n  float n1111 = dot(g1111, Pf1);\n\n  vec4 fade_xyzw = fade(Pf0);\n  vec4 n_0w = mix(vec4(n0000, n1000, n0100, n1100), vec4(n0001, n1001, n0101, n1101), fade_xyzw.w);\n  vec4 n_1w = mix(vec4(n0010, n1010, n0110, n1110), vec4(n0011, n1011, n0111, n1111), fade_xyzw.w);\n  vec4 n_zw = mix(n_0w, n_1w, fade_xyzw.z);\n  vec2 n_yzw = mix(n_zw.xy, n_zw.zw, fade_xyzw.y);\n  float n_xyzw = mix(n_yzw.x, n_yzw.y, fade_xyzw.x);\n  return 2.2 * n_xyzw;\n}\n\n// Classic Perlin noise, periodic version\nfloat cnoise(vec4 P, vec4 rep)\n{\n  vec4 Pi0 = mod(floor(P), rep); // Integer part modulo rep\n  vec4 Pi1 = mod(Pi0 + 1.0, rep); // Integer part + 1 mod rep\n  vec4 Pf0 = fract(P); // Fractional part for interpolation\n  vec4 Pf1 = Pf0 - 1.0; // Fractional part - 1.0\n  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n  vec4 iy = vec4(Pi0.yy, Pi1.yy);\n  vec4 iz0 = vec4(Pi0.zzzz);\n  vec4 iz1 = vec4(Pi1.zzzz);\n  vec4 iw0 = vec4(Pi0.wwww);\n  vec4 iw1 = vec4(Pi1.wwww);\n\n  vec4 ixy = permute(permute(ix) + iy);\n  vec4 ixy0 = permute(ixy + iz0);\n  vec4 ixy1 = permute(ixy + iz1);\n  vec4 ixy00 = permute(ixy0 + iw0);\n  vec4 ixy01 = permute(ixy0 + iw1);\n  vec4 ixy10 = permute(ixy1 + iw0);\n  vec4 ixy11 = permute(ixy1 + iw1);\n\n  vec4 gx00 = ixy00 / 7.0;\n  vec4 gy00 = floor(gx00) / 7.0;\n  vec4 gz00 = floor(gy00) / 6.0;\n  gx00 = fract(gx00) - 0.5;\n  gy00 = fract(gy00) - 0.5;\n  gz00 = fract(gz00) - 0.5;\n  vec4 gw00 = vec4(0.75) - abs(gx00) - abs(gy00) - abs(gz00);\n  vec4 sw00 = step(gw00, vec4(0.0));\n  gx00 -= sw00 * (step(0.0, gx00) - 0.5);\n  gy00 -= sw00 * (step(0.0, gy00) - 0.5);\n\n  vec4 gx01 = ixy01 / 7.0;\n  vec4 gy01 = floor(gx01) / 7.0;\n  vec4 gz01 = floor(gy01) / 6.0;\n  gx01 = fract(gx01) - 0.5;\n  gy01 = fract(gy01) - 0.5;\n  gz01 = fract(gz01) - 0.5;\n  vec4 gw01 = vec4(0.75) - abs(gx01) - abs(gy01) - abs(gz01);\n  vec4 sw01 = step(gw01, vec4(0.0));\n  gx01 -= sw01 * (step(0.0, gx01) - 0.5);\n  gy01 -= sw01 * (step(0.0, gy01) - 0.5);\n\n  vec4 gx10 = ixy10 / 7.0;\n  vec4 gy10 = floor(gx10) / 7.0;\n  vec4 gz10 = floor(gy10) / 6.0;\n  gx10 = fract(gx10) - 0.5;\n  gy10 = fract(gy10) - 0.5;\n  gz10 = fract(gz10) - 0.5;\n  vec4 gw10 = vec4(0.75) - abs(gx10) - abs(gy10) - abs(gz10);\n  vec4 sw10 = step(gw10, vec4(0.0));\n  gx10 -= sw10 * (step(0.0, gx10) - 0.5);\n  gy10 -= sw10 * (step(0.0, gy10) - 0.5);\n\n  vec4 gx11 = ixy11 / 7.0;\n  vec4 gy11 = floor(gx11) / 7.0;\n  vec4 gz11 = floor(gy11) / 6.0;\n  gx11 = fract(gx11) - 0.5;\n  gy11 = fract(gy11) - 0.5;\n  gz11 = fract(gz11) - 0.5;\n  vec4 gw11 = vec4(0.75) - abs(gx11) - abs(gy11) - abs(gz11);\n  vec4 sw11 = step(gw11, vec4(0.0));\n  gx11 -= sw11 * (step(0.0, gx11) - 0.5);\n  gy11 -= sw11 * (step(0.0, gy11) - 0.5);\n\n  vec4 g0000 = vec4(gx00.x,gy00.x,gz00.x,gw00.x);\n  vec4 g1000 = vec4(gx00.y,gy00.y,gz00.y,gw00.y);\n  vec4 g0100 = vec4(gx00.z,gy00.z,gz00.z,gw00.z);\n  vec4 g1100 = vec4(gx00.w,gy00.w,gz00.w,gw00.w);\n  vec4 g0010 = vec4(gx10.x,gy10.x,gz10.x,gw10.x);\n  vec4 g1010 = vec4(gx10.y,gy10.y,gz10.y,gw10.y);\n  vec4 g0110 = vec4(gx10.z,gy10.z,gz10.z,gw10.z);\n  vec4 g1110 = vec4(gx10.w,gy10.w,gz10.w,gw10.w);\n  vec4 g0001 = vec4(gx01.x,gy01.x,gz01.x,gw01.x);\n  vec4 g1001 = vec4(gx01.y,gy01.y,gz01.y,gw01.y);\n  vec4 g0101 = vec4(gx01.z,gy01.z,gz01.z,gw01.z);\n  vec4 g1101 = vec4(gx01.w,gy01.w,gz01.w,gw01.w);\n  vec4 g0011 = vec4(gx11.x,gy11.x,gz11.x,gw11.x);\n  vec4 g1011 = vec4(gx11.y,gy11.y,gz11.y,gw11.y);\n  vec4 g0111 = vec4(gx11.z,gy11.z,gz11.z,gw11.z);\n  vec4 g1111 = vec4(gx11.w,gy11.w,gz11.w,gw11.w);\n\n  vec4 norm00 = taylorInvSqrt(vec4(dot(g0000, g0000), dot(g0100, g0100), dot(g1000, g1000), dot(g1100, g1100)));\n  g0000 *= norm00.x;\n  g0100 *= norm00.y;\n  g1000 *= norm00.z;\n  g1100 *= norm00.w;\n\n  vec4 norm01 = taylorInvSqrt(vec4(dot(g0001, g0001), dot(g0101, g0101), dot(g1001, g1001), dot(g1101, g1101)));\n  g0001 *= norm01.x;\n  g0101 *= norm01.y;\n  g1001 *= norm01.z;\n  g1101 *= norm01.w;\n\n  vec4 norm10 = taylorInvSqrt(vec4(dot(g0010, g0010), dot(g0110, g0110), dot(g1010, g1010), dot(g1110, g1110)));\n  g0010 *= norm10.x;\n  g0110 *= norm10.y;\n  g1010 *= norm10.z;\n  g1110 *= norm10.w;\n\n  vec4 norm11 = taylorInvSqrt(vec4(dot(g0011, g0011), dot(g0111, g0111), dot(g1011, g1011), dot(g1111, g1111)));\n  g0011 *= norm11.x;\n  g0111 *= norm11.y;\n  g1011 *= norm11.z;\n  g1111 *= norm11.w;\n\n  float n0000 = dot(g0000, Pf0);\n  float n1000 = dot(g1000, vec4(Pf1.x, Pf0.yzw));\n  float n0100 = dot(g0100, vec4(Pf0.x, Pf1.y, Pf0.zw));\n  float n1100 = dot(g1100, vec4(Pf1.xy, Pf0.zw));\n  float n0010 = dot(g0010, vec4(Pf0.xy, Pf1.z, Pf0.w));\n  float n1010 = dot(g1010, vec4(Pf1.x, Pf0.y, Pf1.z, Pf0.w));\n  float n0110 = dot(g0110, vec4(Pf0.x, Pf1.yz, Pf0.w));\n  float n1110 = dot(g1110, vec4(Pf1.xyz, Pf0.w));\n  float n0001 = dot(g0001, vec4(Pf0.xyz, Pf1.w));\n  float n1001 = dot(g1001, vec4(Pf1.x, Pf0.yz, Pf1.w));\n  float n0101 = dot(g0101, vec4(Pf0.x, Pf1.y, Pf0.z, Pf1.w));\n  float n1101 = dot(g1101, vec4(Pf1.xy, Pf0.z, Pf1.w));\n  float n0011 = dot(g0011, vec4(Pf0.xy, Pf1.zw));\n  float n1011 = dot(g1011, vec4(Pf1.x, Pf0.y, Pf1.zw));\n  float n0111 = dot(g0111, vec4(Pf0.x, Pf1.yzw));\n  float n1111 = dot(g1111, Pf1);\n\n  vec4 fade_xyzw = fade(Pf0);\n  vec4 n_0w = mix(vec4(n0000, n1000, n0100, n1100), vec4(n0001, n1001, n0101, n1101), fade_xyzw.w);\n  vec4 n_1w = mix(vec4(n0010, n1010, n0110, n1110), vec4(n0011, n1011, n0111, n1111), fade_xyzw.w);\n  vec4 n_zw = mix(n_0w, n_1w, fade_xyzw.z);\n  vec2 n_yzw = mix(n_zw.xy, n_zw.zw, fade_xyzw.y);\n  float n_xyzw = mix(n_yzw.x, n_yzw.y, fade_xyzw.x);\n  return 2.2 * n_xyzw;\n}\n\nfloat snoise(vec2 v)\n  {\n  const vec4 C = vec4(0.211324865405187, // (3.0-sqrt(3.0))/6.0\n                      0.366025403784439, // 0.5*(sqrt(3.0)-1.0)\n                     -0.577350269189626, // -1.0 + 2.0 * C.x\n                      0.024390243902439); // 1.0 / 41.0\n// First corner\n  vec2 i = floor(v + dot(v, C.yy) );\n  vec2 x0 = v - i + dot(i, C.xx);\n\n// Other corners\n  vec2 i1;\n  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0\n  //i1.y = 1.0 - i1.x;\n  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\n  // x0 = x0 - 0.0 + 0.0 * C.xx ;\n  // x1 = x0 - i1 + 1.0 * C.xx ;\n  // x2 = x0 - 1.0 + 2.0 * C.xx ;\n  vec4 x12 = x0.xyxy + C.xxzz;\n  x12.xy -= i1;\n\n// Permutations\n  i = mod(i, 289.0); // Avoid truncation effects in permutation\n  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))\n+ i.x + vec3(0.0, i1.x, 1.0 ));\n\n  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);\n  m = m*m ;\n  m = m*m ;\n\n// Gradients: 41 points uniformly over a line, mapped onto a diamond.\n// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)\n\n  vec3 x = 2.0 * fract(p * C.www) - 1.0;\n  vec3 h = abs(x) - 0.5;\n  vec3 ox = floor(x + 0.5);\n  vec3 a0 = x - ox;\n\n// Normalise gradients implicitly by scaling m\n// Inlined for speed: m *= taylorInvSqrt( a0*a0 + h*h );\n  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );\n\n// Compute final noise value at P\n  vec3 g;\n  g.x = a0.x * x0.x + h.x * x0.y;\n  g.yz = a0.yz * x12.xz + h.yz * x12.yw;\n  return 130.0 * dot(m, g);\n}\n\nfloat snoise(vec3 v)\n{\n  const vec2 C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i = floor(v + dot(v, C.yyy) );\n  vec3 x0 = v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g;\n  vec3 i1 = min( g.xyz, l.zxy );\n  vec3 i2 = max( g.xyz, l.zxy );\n\n  // x0 = x0 - 0.0 + 0.0 * C.xxx;\n  // x1 = x0 - i1 + 1.0 * C.xxx;\n  // x2 = x0 - i2 + 2.0 * C.xxx;\n  // x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D.yyy; // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod(i, 289.0 );\n  vec4 p = permute( permute( permute(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3 ns = n_ * D.wyz - D.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z); // mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ ); // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1.xy,h.z);\n  vec3 p3 = vec3(a1.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n}\n\nfloat snoise(vec4 v)\n{\n  const vec4 C = vec4( 0.138196601125011, // (5 - sqrt(5))/20 G4\n                        0.276393202250021, // 2 * G4\n                        0.414589803375032, // 3 * G4\n                       -0.447213595499958); // -1 + 4 * G4\n\n  // (sqrt(5) - 1)/4 = F4, used once below\n  #define F4 0.309016994374947451\n\n// First corner\n  vec4 i = floor(v + dot(v, vec4(F4)) );\n  vec4 x0 = v - i + dot(i, C.xxxx);\n\n// Other corners\n\n// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)\n  vec4 i0;\n  vec3 isX = step( x0.yzw, x0.xxx );\n  vec3 isYZ = step( x0.zww, x0.yyz );\n// i0.x = dot( isX, vec3( 1.0 ) );\n  i0.x = isX.x + isX.y + isX.z;\n  i0.yzw = 1.0 - isX;\n// i0.y += dot( isYZ.xy, vec2( 1.0 ) );\n  i0.y += isYZ.x + isYZ.y;\n  i0.zw += 1.0 - isYZ.xy;\n  i0.z += isYZ.z;\n  i0.w += 1.0 - isYZ.z;\n\n  // i0 now contains the unique values 0,1,2,3 in each channel\n  vec4 i3 = clamp( i0, 0.0, 1.0 );\n  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );\n  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );\n\n  // x0 = x0 - 0.0 + 0.0 * C.xxxx\n  // x1 = x0 - i1 + 0.0 * C.xxxx\n  // x2 = x0 - i2 + 0.0 * C.xxxx\n  // x3 = x0 - i3 + 0.0 * C.xxxx\n  // x4 = x0 - 1.0 + 4.0 * C.xxxx\n  vec4 x1 = x0 - i1 + C.xxxx;\n  vec4 x2 = x0 - i2 + C.yyyy;\n  vec4 x3 = x0 - i3 + C.zzzz;\n  vec4 x4 = x0 + C.wwww;\n\n  // Permutations\n  i = mod(i, 289.0);\n  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);\n  vec4 j1 = permute( permute( permute( permute (\n             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))\n           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))\n           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))\n           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));\n\n  // Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope\n  // 7*7*6 = 294, which is close to the ring size 17*17 = 289.\n  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;\n\n  vec4 p0 = grad4(j0, ip);\n  vec4 p1 = grad4(j1.x, ip);\n  vec4 p2 = grad4(j1.y, ip);\n  vec4 p3 = grad4(j1.z, ip);\n  vec4 p4 = grad4(j1.w, ip);\n\n  // Normalise gradients\n  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n  p4 *= taylorInvSqrt(dot(p4,p4));\n\n  // Mix contributions from the five corners\n  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);\n  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4) ), 0.0);\n  m0 = m0 * m0;\n  m1 = m1 * m1;\n  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))\n               + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;\n\n}\n\n<% } %>\n\n          #endif\n\n\nconst float frequency = 1.0;\n\n\nvoid main() {\n  vec2 uv = vTexCoords.xy;\n\n  vec3 tc = vec3(1.0, 0.0, 0.0);\n  if (uv.x < (vx_offset-0.005))\n  {\n  /*\n    float V = vTexCoords.y;\n\n    float dp = length(vec2(dFdx(V), dFdy(V)));\n    float logdp = -log2(dp * 8.0);\n    float ilogdp = floor(logdp);\n    float stripes = exp2(ilogdp);\n    float noise = snoise(vPos);\n\n    float sawtooth = fract((V + noise * 0.025) * frequency * stripes);\n    float triangle = abs(2.0 * sawtooth - 1.0);\n\n    // adjust line width\n    float transition = logdp - ilogdp;\n\n    // taper ends\n    triangle = abs((1.0 + transition) * triangle - transition);\n\n    const float edgew = 0.3; // width of smooth step\n    float edge0 = 0.0; /// clamp(LightIntensity - edgew, 0, 1)\n    float edge1 = 1.0; /// clamp(LightIntensity, 0, 1)\n    float square = 1.0 - smoothstep(edge0, edge1, triangle);\n\n    tc = vec3(square * texture2D(sceneTex, uv).rgb);\n  */\n\n\n\n    float lum = length(texture2D(sceneTex, uv).rgb);\n    tc = vec3(1.0, 1.0, 1.0);\n\n    if (lum < lum_threshold_1)\n    {\n      if (mod(gl_FragCoord.x + gl_FragCoord.y, 10.0) == 0.0)\n        tc = vec3(0.0, 0.0, 0.0);\n    }  \n\n    if (lum < lum_threshold_2)\n    {\n      if (mod(gl_FragCoord.x - gl_FragCoord.y, 10.0) == 0.0)\n        tc = vec3(0.0, 0.0, 0.0);\n    }  \n\n    if (lum < lum_threshold_3)\n    {\n      if (mod(gl_FragCoord.x + gl_FragCoord.y - hatch_y_offset, 10.0) == 0.0)\n        tc = vec3(0.0, 0.0, 0.0);\n    }  \n\n    if (lum < lum_threshold_4)\n    {\n      if (mod(gl_FragCoord.x - gl_FragCoord.y - hatch_y_offset, 10.0) == 0.0)\n        tc = vec3(0.0, 0.0, 0.0);\n    }\n  }\n  else if (uv.x>=(vx_offset+0.005))\n  {\n    tc = texture2D(sceneTex, uv).rgb;\n  }\n\n  gl_FragColor = vec4(tc, 1.0);\n}\n",
  vertex:"shared attribute vec4 VERTEX_POSITION, VERTEX_COLOR;\nshared attribute vec3 VERTEX_NORMAL;\nshared attribute vec2 VERTEX_TEXCOORDS;\n\nuniform float TIME;\n\nvoid main(void) {\n  gl_Position = pMatrix * mvMatrix * VERTEX_POSITION;\n  vTexCoords = VERTEX_TEXCOORDS;\n  vPos = VERTEX_POSITION.xyz + vec3(0,0,TIME) * 0.2;\n}\n",
exports: {},
name: "xhatch"});
BlenderModel.addResources({"default":{"method":"GET","async":true},"chair1":{"path":"/models/chair.json","material":"tamhatch","position":"0, -1.25, -4"},"chair2":{"path":"/models/chair.json","material":"tamhatch","position":"0, -1.25, 4","direction":"-0.5, 0, 1"},"fan-base":{"path":"/models/ceiling-fan-base.json","material":"tamhatch","position":"0, 6.15, 0"},"fan-blade":{"path":"/models/ceiling-fan-blade.json","material":"tamhatch","position":"0.65, 5.55, 0","direction":"0, -1, 0"},"lightbulb":{"path":"/models/light-bulb.json","lit":false,"shadow_caster":false,"position":"0, 5, 0","direction":"0, -1, 0","scale":0.25},"table":{"path":"/models/table.json","material":"tamhatch"}});
Material.addResources({"tamhatch":{"ambient":{"red":1.0,"green":1.0,"blue":1.0,"alpha":1.0},"diffuse":{"red":1.0,"green":1.0,"blue":1.0,"alpha":1.0},"specular":{"red":1.0,"green":1.0,"blue":1.0,"alpha":1.0},"shininess":30,"layers":[{"type":"Lighting"},{"type":"Hatch"}]},"xhatch":{"ambient":{"red":1.0,"green":1.0,"blue":1.0,"alpha":1.0},"diffuse":{"red":1.0,"green":1.0,"blue":1.0,"alpha":1.0},"specular":{"red":1.0,"green":1.0,"blue":1.0,"alpha":1.0},"shininess":30,"layers":[{"type":"Xhatch"}]}});
Jax.routes.root(TamhatchController, "index");
Jax.routes.map("tamhatch/index", TamhatchController, "index");
Jax.routes.map("hatch/index", HatchController, "index");
