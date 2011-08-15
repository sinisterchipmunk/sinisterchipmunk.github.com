from spec_helper import *

class UnsmoothCubeNormalsTest(JaxExportTestCase):
  def mesh_data(self):
    return {
      'smooth': False,
      'vertices': [ (-1,-1,-1), # blb, 0
                    ( 1,-1,-1), # brb, 1
                    (-1, 1,-1), # tlb, 2
                    ( 1, 1,-1), # trb, 3
                    (-1,-1, 1), # blf, 4
                    ( 1,-1, 1), # brf, 5
                    (-1, 1, 1), # tlf, 6
                    ( 1, 1, 1), # trf, 7
                  ],
      'faces': [ (2,3,1,0), # back
                 (6,4,5,7), # front
                 (2,6,7,3), # top
                 (4,0,1,5), # bottom
                 (0,4,6,2), # left
                 (7,5,1,3)  # right
               ]
    }

  # decided not to implement the optimization. It's only marginal gains, and due to vertex indices,
  # it's not as simple as simply collapsing normals.
  def xtest_produces_correct_normals(self):
    # filesize optimization - produce only 1 normal per face, then create 2 duplicates on JS side
    # should be 2 faces since quads are converted to tris
    self.assertEqual(self.result['normals'],   [ 0, 0,-1,   0, 0,-1,   # back
                                                 0, 0, 1,   0, 0, 1,   # front
                                                 0, 1, 0,   0, 1, 0,   # top
                                                 0,-1, 0,   0,-1, 0,   # bottom
                                                -1, 0, 0,  -1, 0, 0,   # left
                                                 1, 0, 0,   1, 0, 0    # right
                                               ])
