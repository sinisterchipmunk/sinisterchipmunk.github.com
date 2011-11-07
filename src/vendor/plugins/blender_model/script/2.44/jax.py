def export_mesh(mesh):
  vertices  = []
  colors    = []
  texCoords = []
  normals   = []
  indices   = []
  
  indexLookup = []
  
  def pushTri(face, order, vertices, colors, texCoords, normals, indices):
    for cur in order:
      vertex = color = texCoord = normal = 0

      # get the data
      vertex = [face.verts[cur].co.x, face.verts[cur].co.y, face.verts[cur].co.z]
      if face.smooth:
        normal = [face.verts[cur].no.x, face.verts[cur].no.y, face.verts[cur].no.z]
      else:
        normal = [face.no.x, face.no.y, face.no.z]
      if mesh.vertexColors:
        color = [face.col[cur].r / 255.0, face.col[cur].g / 255.0, face.col[cur].b / 255.0, face.col[cur].a / 255.0]
      if mesh.faceUV:
        texCoord = [face.uv[cur][0], face.uv[cur][1]]
    
      # see if we can use an existing index
      indexKey = [vertex, normal, color, texCoord]
      if indexLookup.count(indexKey) > 0:
        # yes!
        index = indexLookup.index(indexKey)
      else:
        # no, add a new index
        index = len(indexLookup)
        indexLookup.append(indexKey)
        # add data for the new index
        vertices += vertex
        normals += normal
        if mesh.vertexColors:
          colors += color
        if mesh.faceUV:
          texCoords += texCoord
      
      indices.append(index)
    
  for face in mesh.faces:
    if len(face.verts) == 4: # quad, convert to tris
      pushTri(face, [1,2,0], vertices, colors, texCoords, normals, indices)
      pushTri(face, [0,2,3], vertices, colors, texCoords, normals, indices)
    elif len(face.verts) == 3: # tri
      pushTri(face, [0,1,2], vertices, colors, texCoords, normals, indices)
    else:
      raise "Faces must be either triangles or quads"
  
  def jsonify(*arys):
    return [','.join(str(x) for x in ary) for ary in arys]
    
  json  = '{'
  json +=   '"vertices":[%s],'
  json +=   '"colors":[%s],'
  json +=   '"textureCoords":[%s],'
  json +=   '"normals":[%s],'
  json +=   '"indices":[%s]'
  json += '}'
  return json % tuple(jsonify(vertices, colors, texCoords, normals, indices))
