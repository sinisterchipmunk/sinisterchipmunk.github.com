require 'thor/util'
require 'fileutils'
require 'yaml'

$:.unshift File.dirname(__FILE__)

module Blender
  autoload :Scripts, "blender/scripts"
  module_function
  
  def reset!
    instance_variables.each do |ivar|
      instance_variable_set(ivar, nil)
    end
  end
  
  def use_config=(a)
    @use_config = a
  end
  
  def use_config
    @use_config = true if @use_config.nil?
  end

  def config
    @config ||= if use_config && File.file?(config = File.join(Thor::Util.user_home, config_filename))
      YAML::load(File.read(config)) || {}
    else
      {}
    end
  end
  
  def config_filename
    ".jax_blender_model"
  end
  
  def config_path
    File.join(Thor::Util.user_home, config_filename)
  end
  
  def save_config
    return if !use_config
    File.open(File.join(Thor::Util.user_home, ".jax_blender_model"), "w") do |f|
      f.puts @config.to_yaml
    end
  rescue
    # fail silently
    nil
  end
  
  def path
    @path ||= config[:blender_path] || begin
      config[:blender_path] = File.join(base_path, version)
      save_config
      config[:blender_path]
    end
  end
  
  def path=(path)
    @path = config[:blender_path] = path
  end
  
  def base_path
    @base_path ||= begin
      globs = [
        File.join(Thor::Util.user_home, ".blender"),
        File.join(ENV['APPDATA'].to_s, "Roaming/Blender Foundation/Blender"),
        File.join(ENV['APPDATA'].to_s, "Blender Foundation/Blender"),
        "/usr/share/blender",
        "/usr/lib/blender",
        "/Applications/blender.app/Contents/MacOS/",
        File.join(Thor::Util.user_home, "Applications/blender.app/Contents/MacOS"),
        "C:/Program Files/[bB]lender*/.blender"
      ]
      # first non-nil glob match
      globs.collect { |glob| Dir.glob(glob).first }.detect { |path| !!path } or begin
        output.print "Please type the full path to Blender: "
        input.gets.chomp
      end
    end
  end
  
  def version
    @version ||= begin
      if version = Dir[File.join(base_path, '2.5*')].first
        File.basename(version)
      else
        raise 'This version of Blender is unsupported. Try using Blender 2.58.'
      end
    end
  end

  def modules_path
    @modules_path ||= File.expand_path("scripts/modules", path)
  end
end
