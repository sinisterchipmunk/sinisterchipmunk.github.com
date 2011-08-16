/**
 * class BlenderModel < Jax.Model
 * 
 **/
var BlenderModel = (function() {
  return Jax.Model.create({
    after_initialize: function() {
      var self = this;
      if (self.color) self.color = Jax.Util.colorize(self.color);
      self.mesh = new Jax.Mesh({
        material: self.material,
        color: self.color,
        lit: self.lit,
        
        init: function(vertices, colors, texCoords, normals, indices) {
          if (self.data) {
            function push(source, dest, scale) {
              if (!scale) scale = 1.0;
              for (i = 0; source && i < source.length; i++)
                dest.push(source[i] * scale);
            }
            
            var i, j;
            for (var meshName in self.data)
            {
              var meshData = self.data[meshName];
              push(meshData.vertices, vertices, self.scale);
              // push(meshData.colors, colors);
              // push(meshData.textureCoords, texCoords);
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
                
                // FIXME this is redundant data. Should the above layer stuff be defined for index 0?
                if (i == 0)
                  push(meshData.colors[i], colors);
              }
              for (i = 0; meshData.textureCoords && i < meshData.textureCoords.length; i++) {
                // TODO uv layer stuff
                
                // FIXME this is redundant data. Should the above layer stuff be defined for index 0?
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
              if (self.onload) self.onload(self.mesh);
            } else { // error
              // queue and raise upon next render, so developer can catch it appropriately
              self.xhrError = xhr.status+" ("+self.method+" "+self.path+" - async: "+self.async+")";
            }
          }
        };
        xhr.open(self.method, self.path, self.async);
        xhr.send(null);
      }
    },
    
    render: function($super, context, options) {
      if (typeof(this.unlit) != "undefined")
        options = Jax.Util.normalizeOptions(options, {unlit:this.unlit});
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
