from spec_helper import *

class OptionsTest(JaxExportTestCase):
  def mesh_data(self):
    return {
      'vertices': [(-1,-1,0), (1,-1,0), (-1,1,0), (1,1,0)],
      "uv": [(-1,-1),  (1,-1),  (-1,1),  (1,1)],
      'colors': [(1,0,0), (0,1,0), (0,0,1), (1,0,1)],
      'faces': [(0,1,2), (2,1,3)],
    }

  def export_options(self):
    return { }

  def test_everything_else_is_included(self):
    for key in self.result.keys():
      if (not key in self.export_options()) or self.export_options()[key]:
        self.assertTrue(len(self.result[key]) > 0)

# flip yz
class FlipYZOptionsSmoothTest(OptionsTest):
  def export_options(self):
    return { 'flip_yz': True }
    
  def mesh_data(self):
    data = OptionsTest.mesh_data(self)
    data['smooth'] = True
    return data
  
  def test_flips_yz_vertices(self):
    self.assertEqual(self.result['vertices'], [-1.0,0.0,-1.0,  1.0,0.0,-1.0,  -1.0,0,1.0,  1.0,0,1.0])
  
  def test_flips_yz_normals(self):
    self.assertEqual(self.result['normals'], [0,1,0,  0,1,0,  0,1,0,  0,1,0])

class FlipYZOptionsFlatTest(OptionsTest):
  def export_options(self):
    return { 'flip_yz': True }

  def test_flips_yz_vertices(self):
    self.assertEqual(self.result['vertices'], [-1.0,0.0,-1.0,  1.0,0.0,-1.0,  -1.0,0,1.0,  1.0,0,1.0])

  def test_flips_yz_normals(self):
    self.assertEqual(self.result['normals'], [0,1,0,  0,1,0,  0,1,0,  0,1,0])

# scale
class ScaleOptionsTest(OptionsTest):
  def export_options(self):
    return { 'scale': 0 }

  def test_scale(self):
    self.assertEqual(self.result['vertices'], [0,0,0,  0,0,0,  0,0,0,  0,0,0])

# omit vertices
class VertexOptionsTest(OptionsTest):
  def export_options(self):
    return { 'vertices': False }

  def test_omits_vertices(self):
    self.assertEqual(len(self.result['vertices']), 0)

# omit texture coords
class UVOptionsTest(OptionsTest):
  def export_options(self):
    return { 'textureCoords': False }

  def test_omits_vertices(self):
    self.assertEqual(len(self.result['textureCoords']), 0)

# omit normals
class NormalOptionsTest(OptionsTest):
  def export_options(self):
    return { 'normals': False }

  def test_omits_normals(self):
    self.assertEqual(len(self.result['normals']), 0)

# omit colors
class ColorOptionsTest(OptionsTest):
  def export_options(self):
    return { 'colors': False }

  def test_omits_colors(self):
    self.assertEqual(len(self.result['colors']), 0)

# omit indices
class UVOptionsTest(OptionsTest):
  def export_options(self):
    return { 'indices': False }

  def test_omits_indices(self):
    self.assertEqual(len(self.result['indices']), 0)
