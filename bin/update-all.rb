#!/usr/bin/env ruby

require File.expand_path('string', File.dirname(__FILE__))

def try(*cmd)
  puts "Executing: #{cmd.join(" ")}"
  unless system *cmd
    puts "uh oh...".red
    exit
  end
end

Dir.chdir "src" do
  try "bundle update jax --local"
  try "ruby frontend/demos.rb"
  try "rake assets:precompile"
  try "cp -r public/* ../"
  try "rake assets:clean"
end

puts "all good".green
