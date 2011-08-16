Dungeon.routes.map do
  map 'particles_test/index'
  map 'chamber/index'
  map 'dungeon/index'
  map 'dungeon/from_chamber', "Dungeon", "from_chamber"
  root 'dungeon'
  # If not given a root controller, no controller will be used when the page is initially loaded.
  # You'll have to load the controller manually, unless you map a root like so:
  #   root 'controller_name'
  # root 'chamber'
  # root 'particles_test'
end
