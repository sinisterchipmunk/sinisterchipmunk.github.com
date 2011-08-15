from spec_helper import *

class AllTexCoordsTest(JaxExportTestCase):
  def mesh_data(self):
    return {
      "vertices": [(-1,-1,0),  (1,-1,0),  (-1,1,0),  (1,1,0)],
      "uv": [(-1,-1),  (1,-1),  (-1,1),  (1,1)],
      "faces": [(0,1,2),  (2,1,3)]
    }
  
  def test_produces_correct_uv_data(self):
    self.assertEqual(self.result['textureCoords'],   [[-1,-1,  1,-1,  -1,1,  1,1]])

class NoTexCoordsTestTest(JaxExportTestCase):
  def mesh_data(self):
    return {
      "vertices": [(-1,-1,0),  (1,-1,0),  (-1,1,0),  (1,1,0)],
      "faces": [(0,1,2),  (2,1,3)]
    }
  
  def test_produces_no_uv_data(self):
    self.assertEqual(self.result['textureCoords'],   [])
