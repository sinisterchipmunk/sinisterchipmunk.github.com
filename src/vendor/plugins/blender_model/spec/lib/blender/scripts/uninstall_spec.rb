require 'spec_helper'
require 'tmpdir'

describe Blender::Scripts do
  def dest
    @dest ||= Dir.mktmpdir
  end
  
  before :each do
    Thor::Util.stub(:user_home).and_return(dest)
    Blender.use_config = true # because we just stubbed it. We want to save the config file so we can
    # test whether it was deleted.
    
    output.stub(:write)
    input.stub(:gets).and_return("n\n", dest, "y\n")
    subject.install!
    subject.uninstall!
  end
  
  it "should remove jax.py" do
    subject.should_not be_installed(dest)
  end
  
  it "should remove config file" do
    File.should_not exist(File.join(dest, ".jax_blender_model"))
  end
end
