ENV['BUNDLE_GEMFILE'] ||= File.expand_path("../../../../Gemfile", File.dirname(__FILE__))

require 'bundler'
Bundler.setup

require File.expand_path("../lib/blender", File.dirname(__FILE__))

Dir[File.expand_path("support/**/*.rb", File.dirname(__FILE__))].each { |f| require f }

RSpec.configure do |c|
  c.before :each do
    Blender.reset!
    Blender.use_config = false
  end
  
  c.include ScriptIO
end
