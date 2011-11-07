from spec_helper import *

class TriangleExportTest(JaxExportTestCase):
  def mesh_data(self):
    return {
      'vertices': [(0,1,0), (-1,0,0), (1,0,0)],
      'faces': [(0,1,2)],
    }
  
  def test_produces_correct_vertices(self):
    self.assertEqual(self.result['vertices'],  [0,1,0,  -1,0,0,  1,0,0])
  def test_produces_correct_indices(self):
    self.assertEqual(self.result['indices'],   [0,1,2])
    
  # now tested in smooth_normals_spec and unsmooth_normals_spec
  # def test_produces_normals(self):
  #   self.assertEqual(len(self.result['normals']),   9)
