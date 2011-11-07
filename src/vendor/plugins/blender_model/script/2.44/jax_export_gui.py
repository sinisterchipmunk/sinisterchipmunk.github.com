#!BPY

"""
Name: 'Jax WebGL Model (.json)'
Blender: 244
Group: 'Export'
Tooltip: 'Jax WebGL Model'
""" 

__author__ = "Colin MacKenzie IV"
__url__ = ("http://github.com/sinisterchipmunk/jax-blender-model")
__version__ = "0.0.1"

__bpydoc__ = """

For more information please go to:
http://github.com/sinisterchipmunk/jax-blender-model
"""
import Blender
from Blender import *
import bpy
from Blender.BGL import *
import jax

def FileSelected(filename):
  if (filename != ''):
    if re.search('\.json$', filename) == None:
      filename = filename + ".json"
  else:
    cutils.Debug.Debug('ERROR: filename is empty','ERROR')

  out = file(filename, 'w')
  sce = bpy.data.scenes.active
  ob = sce.objects.active
  mesh = Mesh.New()        
  mesh.getFromObject(ob.name)
  class_name = ob.name.replace(".", "")
  data_string = '{"%s":%s}' % (class_name, jax.export_mesh(mesh))
  out.write(data_string)
  out.close()
  
  Draw.PupMenu("Export Successful")

Window.FileSelector(FileSelected,"Export .json")

