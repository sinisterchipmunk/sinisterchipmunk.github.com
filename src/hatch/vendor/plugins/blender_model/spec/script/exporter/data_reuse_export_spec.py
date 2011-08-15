from spec_helper import *

class DataReuseExportTest(JaxExportTestCase):
  def mesh_data(self):
    # a quad drawn with triangles
    return {
      'vertices': [(-1,-1,0), (1,-1,0), (-1,1,0), (1,1,0)],
      'faces': [(0,1,2), (2,1,3)]
    }

  def test_produces_correct_vertices(self):
    self.assertEqual(self.result['vertices'],  [-1,-1,0,  1,-1,0,  -1,1,0,  1,1,0])
  def test_produces_correct_indices(self):
    self.assertEqual(self.result['indices'],   [0,1,2,  2,1,3])
