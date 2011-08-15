from spec_helper import *

class PartiallySmoothTest(JaxExportTestCase):
  def mesh_data(self):
    # a quad drawn with triangles
    return {
      'smooth': True,
      'vertices': [(-1,-1,0), (1,-1,0), (-1,1,0), (1,-1,-0.25)],
      'faces': [(0,1,2), (0,1,3)]
    }
  
  def xtest_raises_error(self):
    with self.assertRaises(BaseException):
      self.mesh = self.build_mesh()
      self.mesh.faces[0].use_smooth = False
      self.json = json.dumps(jax.export_mesh(self.mesh, self.export_options()))
      self.result = json.loads(self.json)
