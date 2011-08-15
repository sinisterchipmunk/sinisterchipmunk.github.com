from spec_helper import *

class EmptyExportTest(JaxExportTestCase):
  def test_produces_empty_mesh_data(self):
    self.assertEqual(self.result['vertices'],      [])
    self.assertEqual(self.result['normals'],       [])
    self.assertEqual(self.result['textureCoords'], [])
    self.assertEqual(self.result['colors'],        [])
    self.assertEqual(self.result['indices'],       [])
