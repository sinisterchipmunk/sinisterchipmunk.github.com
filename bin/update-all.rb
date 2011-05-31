#!/usr/bin/env ruby

if ARGV.length == 0
  require 'jax'
  version = Jax::VERSION
else
  version = ARGV[0]
end

require File.expand_path('string', File.dirname(__FILE__))

Dir["src/*"].each do |d|
  File.open(File.join(d, "Gemfile"), "w") do |f|
    f.puts "source \"http://rubygems.org\"\n\ngem 'jax', '#{version}'"
  end
  
  if !system("cd #{d}; bundle update jax --local; rake jax:update; cd ..")
    puts "uh oh...".red
    exit
  end
end

puts "all good".green
