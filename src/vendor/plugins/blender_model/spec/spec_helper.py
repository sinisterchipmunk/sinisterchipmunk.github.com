import unittest
import bpy
import io_mesh_jax.export_jax
import json

ids = 0

def normalize_mesh_data(data):
  if not 'vertices' in data: data['vertices'] = []
  if not 'edges'    in data: data['edges']    = []
  if not 'faces'    in data: data['faces']    = []
  if not 'smooth'   in data: data['smooth']   = False
  if not 'colors'   in data: data['colors']   = []
  if not 'uv'       in data: data['uv']       = []
  return data

def setup_mesh(mesh, data):
  normalize_mesh_data(data)
  mesh.from_pydata(data['vertices'], data['edges'], data['faces'])

  for face in mesh.faces:
    if data['smooth']:
      face.use_smooth = True

  if len(data['uv']) > 0:
    layer = mesh.uv_textures.new()
    for i in range(0, len(mesh.faces)):
      for j in range(0, 2): # each of 2 uv components
        for k in range(0, len(mesh.faces[i].vertices)):
          uv = getattr(layer.data[i], 'uv%i' % (k+1))
          uv[j] = data['uv'][mesh.faces[i].vertices[k]][j]
    
  if len(data['colors']) > 0:
    layer = mesh.vertex_colors.new()
    for i in range(0, len(mesh.faces)):
      for j in range(0, 3): # each of 3 color components
        for k in range(0, len(mesh.faces[i].vertices)):
          color = getattr(layer.data[i], 'color%i' % (k+1))
          color[j] = data['colors'][mesh.faces[i].vertices[k]][j]

  mesh.update()
  return mesh

class JaxExportTestCase(unittest.TestCase):
  def build_mesh(self):
    global ids
    ids += 1
    mesh = bpy.data.meshes.new("Test%s" % str(ids))
    bpy.ops.object.mode_set(mode='OBJECT') # for from_pydata to work
    data = self.mesh_data()
    setup_mesh(mesh, data)
    return mesh

  def export_options(self):
    return { }
    
  def mesh_data(self):
    return { }

  def setUp(self):
    self.mesh = self.build_mesh()
    self.json = json.dumps(io_mesh_jax.export_jax.export_mesh(self.mesh, self.export_options()))
    self.result = json.loads(self.json)
