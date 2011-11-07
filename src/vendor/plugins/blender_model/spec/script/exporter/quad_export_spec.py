from spec_helper import *

class QuadExportTest(JaxExportTestCase):
  def mesh_data(self):
    return {
      'vertices': [(-1,1,0),  (-1,-1,0),  (1,-1,0),  (1,1,0)],
      'faces': [(0,1,2,3)]
    }
  
  def test_produces_triangles(self):
    self.assertEqual(self.result['vertices'],  [-1,-1,0,  1,-1,0,  -1,1,0,  1,1,0])
    self.assertEqual(self.result['indices'],   [0,1,2,  2,1,3])
    # now tested in smooth_normals_spec and unsmooth_normals_spec
    # self.assertEqual(self.result['normals'],   [0,0,1,   0,0,1,  0,0,1,  0,0,1])
