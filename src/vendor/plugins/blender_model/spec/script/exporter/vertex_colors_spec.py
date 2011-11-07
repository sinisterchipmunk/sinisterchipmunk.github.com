from spec_helper import *

class AllVertexColorsTest(JaxExportTestCase):
  def mesh_data(self):
    return {
      'vertices': [(-1,-1,0),  (1,-1,0),  (-1,1,0),  (1,1,0)],
      'colors': [(1,0,0), (0,1,0), (0,0,1), (1,0,1)],
      'faces': [(0,1,2), (2,1,3)]
    }

  def test_produces_correct_color_data(self):
    self.assertEqual(self.result['colors'],   [[1,0,0,  0,1,0,  0,0,1,  1,0,1]])

class NoVertexColorsTest(JaxExportTestCase):
  def mesh_data(self):
    return {
      'vertices': [(-1,-1,0),  (1,-1,0),  (-1,1,0),  (1,1,0)],
      'faces': [(0,1,2), (2,1,3)]
    }

  def test_produces_no_color_data(self):
    self.assertEqual(self.result['colors'],   [])
