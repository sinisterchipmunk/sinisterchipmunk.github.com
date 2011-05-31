#!/usr/bin/env ruby
require 'fileutils'
include FileUtils

require File.expand_path('string', File.dirname(__FILE__))

class Merger
  attr_reader :base
  attr_writer :clean
  include FileUtils
  
  def initialize(base, glob, glob_rx, clean = false)
    @base, @clean = base, !!clean
    @glob, @glob_rx = glob, glob_rx
  end
  
  def start(output = STDOUT)
    @output = output
    Dir[File.expand_path(@glob, base)].each do |path|
      local = path.sub(/^#{Regexp::escape base}\/?#{@glob_rx}\/?/, '')
      copy $~[1], local unless File.directory? path
    end
  end
  
  def clean?
    @clean
  end
  
  def full_path(name, path)
    File.expand_path(File.join("src", name, "pkg", path), base)
  end
  
  # true if src is newer than dest
  def newer?(name, src, dest)
    return File.stat(full_path(name, src)).mtime > File.stat(dest).mtime
  end
  
  def remove(name, destination)
    if File.exist?(destination)
      log name, "REMOVING".green, destination
      rm destination
    else
      log name, "MISSING".red, destination
    end
  end
  
  def copy(name, path)
    destination = File.join(base, path)
    
    if clean?
      remove name, destination
    else
      if File.exist?(destination) && !newer?(name, path, destination)
        log name, "WARNING".red, "not replacing existing file #{path}"
      else
        log name, "OK".green, destination
        mkdir_p File.dirname(destination)
        cp full_path(name, path), destination
      end
    end
  end
  
  def log(*args)
    @output.print args.join("\t") + "\n" if @output
  end
end

if $0 == __FILE__
  Merger.new(File.expand_path("..", File.dirname(__FILE__)), "src/*/pkg/**/*",
             "src\\/(.*?)\\/pkg", ARGV[0] && ARGV[0].downcase.strip == "clean").start($stdout)
end
