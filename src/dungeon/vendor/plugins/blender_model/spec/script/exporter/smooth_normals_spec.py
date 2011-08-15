from spec_helper import *

class SmoothNormalsTest(JaxExportTestCase):
  def mesh_data(self):
    # a quad drawn with triangles
    return {
      'smooth': True,
      'vertices': [(-1,-1,0), (1,-1,0), (-1,1,0), (1,-1,-0.25)],
      'faces': [(0,1,2), (0,1,3)]
    }

  def test_produces_correct_vertices(self):
    self.assertEqual(self.result['vertices'],  [-1,-1,0,  1,-1,0,  -1,1,0,  1,-1,-0.25])
  def test_produces_correct_normals(self):
    self.assertEqual(len(self.result['normals']), 12)
  def test_produces_correct_indices(self):
    self.assertEqual(self.result['indices'],   [0,1,2,  0,1,3])
