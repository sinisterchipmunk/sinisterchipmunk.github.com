require 'bundler'
Bundler.setup

require 'rspec/core/rake_task'

namespace :test do
  desc "Test the ruby scripts"
  RSpec::Core::RakeTask.new(:ruby)
  
  desc "Test the Blender export python script"
  task :python do
    require 'blender'
    lib_path = File.expand_path(File.join("script", Blender.version), File.dirname(__FILE__))
    spec_path = File.expand_path("spec", File.dirname(__FILE__))
    spec_pattern = ENV['SPEC'] || "**/*_spec.py"
    unittest_path = File.expand_path('../..', `python -c "import unittest; print(unittest.__file__)"`.chomp)
    
    pycode = <<-end_pycode.lines.to_a.collect { |line| line.strip }
      import sys
      sys.path.append("#{File.dirname(__FILE__)}")
      sys.path.append("#{lib_path}")
      sys.path.append("#{spec_path}")
      sys.path.append("#{unittest_path}")
      import unittest
      sys.path.pop()
      import spec_helper
      
      suite = unittest.TestSuite()
    end_pycode
    
    Dir[File.join(spec_path, spec_pattern)].each do |fi|
      module_name = File.basename(fi).sub(/\.pyc?$/, '')
      pycode << "sys.path.append(\"#{File.dirname(fi)}\")"
      pycode << "import #{module_name}"
      pycode << "suite.addTest(unittest.TestLoader().loadTestsFromModule(#{module_name}))"
    end
    
    pycode << 'unittest.TextTestRunner(verbosity=1).run(suite)'

    File.open("python_specs.py", "w") do |f|
      f.puts pycode
    end
    command = "#{File.join(Blender.base_path, 'blender')} --background --python ./python_specs.py"
    if ENV['DEBUG']
      puts command
      puts
    end
    
    raise "Python specs failed" unless system command
    # only delete it if all specs passed
    if !ENV['DEBUG']
      FileUtils.rm("python_specs.py") if File.file?("python_specs.py")
      Dir[File.expand_path('**/__pycache__', File.dirname(__FILE__))].each { |f| FileUtils.rm_rf f }
    end
  end
end

task :default => ["test:ruby", "test:python"]

desc "install the Blender scripts"
task :install do
  load File.expand_path("install.rb", File.dirname(__FILE__))
end

desc "uninstall the Blender scripts"
task :uninstall do
  load File.expand_path("uninstall.rb", File.dirname(__FILE__))
end
