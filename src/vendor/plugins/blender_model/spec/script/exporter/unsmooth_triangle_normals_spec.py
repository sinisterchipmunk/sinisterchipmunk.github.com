from spec_helper import *

class UnsmoothTriangleNormalsTest(JaxExportTestCase):
  def mesh_data(self):
    # a quad drawn with triangles
    return {
      'smooth': False,
      'vertices': [(-1,-1,0), (1,-1,0), (-1,1,0), (1,-1,-0.25)],
      'faces': [(0,1,2), (1,0,3)]
    }

  def test_produces_correct_vertices(self):
    self.assertEqual(self.result['vertices'],  [-1,-1,0,  1,-1,0,  -1,1,0,  1,-1,0,  -1,-1,0,  1,-1,-0.25])
  # decided not to implement the optimization. It's only marginal gains, and due to vertex indices,
  # it's not as simple as simply collapsing normals.
  def xtest_produces_correct_normals(self):
    # filesize optimization - produce only 1 normal per face, then create 2 duplicates on JS side
    self.assertEqual(self.result['normals'],   [0,0,1,  0,-1,0])
  def test_produces_correct_indices(self):
    self.assertEqual(self.result['indices'],   [0,1,2,  3,4,5])
    