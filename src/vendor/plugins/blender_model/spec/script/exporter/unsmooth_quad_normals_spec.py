from spec_helper import *

class UnsmoothQuadNormalsTest(JaxExportTestCase):
  def mesh_data(self):
    return {
      'smooth': False,
      'vertices': [(-1,-1,0), (1,-1,0), (1,1,0), (-1,1,0)],
      'faces': [(0,1,2,3)]
    }

  # decided not to implement the optimization. It's only marginal gains, and due to vertex indices,
  # it's not as simple as simply collapsing normals.
  def xtest_produces_correct_normals(self):
    # filesize optimization - produce only 1 normal per face, then create 2 duplicates on JS side
    # should be 2 faces since quads are converted to tris
    self.assertEqual(self.result['normals'],   [0,0,1,  0,0,1])
