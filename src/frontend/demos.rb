require File.expand_path("../config/environment", File.dirname(__FILE__))

DEMOS = [
  { :name => "Blobular!",            :controller => "blobular" },
  { :name => "Dungeon",              :controller => "dungeon" },
  { :name => "Lights &amp; Shadows", :controller => "lights_and_shadows" },
  { :name => "Materials",            :controller => "materials" },
  { :name => "Meadow",               :controller => "meadow" },
  { :name => "Hatching",             :controller => "tamhatch" }
]

class Demo
  def initialize(hash)
    @hash = hash
  end
  
  def controller_name
    @hash[:controller]
  end
  
  def demo_name
    @hash[:name]
  end
  
  def help_file?
    File.exist? path_to(help_file)
  end
  
  def help_file
    File.join "help", file_name
  end
  
  def file_name(ext = "html.erb")
    "#{controller_name}.#{ext}"
  end
  
  def render(file)
    ERB.new(File.read path_to(file)).result(binding)
  end
  
  def path_to(*parts)
    path = File.join(*parts)
    File.expand_path(path, File.dirname(__FILE__))
  end
end

DEMOS.each do |demo_hash|
  demo = Demo.new(demo_hash)
  File.open(demo.path_to("../public", demo.file_name('html')), "w") do |f|
    f.puts demo.render("layout.html.erb")
  end
end
