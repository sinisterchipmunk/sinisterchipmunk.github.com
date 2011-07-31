#!/usr/bin/env ruby

require File.expand_path('string', File.dirname(__FILE__))

Dir["src/*"].each do |d|
  if !system("cd #{d}; bundle exec jax package; cd ..")
    puts "uh oh...".red
    exit
  end
end

puts "all good".green
