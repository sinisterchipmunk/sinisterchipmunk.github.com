class Blender::Scripts
  attr_reader :input, :output
  
  def initialize(input = $stdin, output = $stdout)
    @input, @output = input, output
  end
  
  def scripts_path
    @scripts_path || File.join(Blender.path, "scripts/addons")
  end
  
  def each_script
    base = File.expand_path(File.join("../../script", Blender.version), File.dirname(__FILE__))
    Dir[File.join(base, "**/*.py")].each do |file|
      dest = file.sub(/^#{Regexp::escape base}\/?/, '')
      yield file, dest
    end
  end

  def copy_scripts!
    each_script do |src, dst|
      dst = File.join(scripts_path, dst)
      FileUtils.mkdir_p File.dirname(dst)
      FileUtils.cp src, dst
    end
  end
  
  def install!
    output.puts "Blender scripts will be installed to #{scripts_path}."
    output.print "Is this correct? [(Y)es, (N)o, (S)kip]: "
    choice = input.gets.chomp.downcase[0]
    output.puts
    
    case choice
      when ?y
        copy_scripts!
      when ?n
        output.print "Please enter the correct install path: "
        @scripts_path = input.gets.chomp
        install!
      when ?s
        # do nothing
        return
      else install!
    end
    
    output.puts "Blender scripts were installed. You may still have "
    output.puts "to activate them from within Blender preferences."
    output.puts
  end
  
  def uninstall!
    each_script do |src, dst|
      path = File.join(scripts_path, File.dirname(dst))
      FileUtils.rm_rf path if File.directory?(path)
    end
    FileUtils.rm Blender.config_path if File.file?(Blender.config_path)
  end
  
  def installed?(path = scripts_path)
    Dir[File.join(path, "**/*.py")].first
  end
end
