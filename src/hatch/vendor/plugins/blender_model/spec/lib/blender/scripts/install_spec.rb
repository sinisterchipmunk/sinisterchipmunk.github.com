require 'spec_helper'
require 'tmpdir'

describe Blender::Scripts do
  before(:each) do
    Blender.path = Dir.mktmpdir
  end
  
  it "should confirm installation directory" do
    output.stub(:write)
    output.should_receive(:write).with("Blender scripts will be installed to #{subject.scripts_path}.")
    output.should_receive(:write).with("Is this correct? [(Y)es, (N)o, (S)kip]: ")
    input.should_receive(:gets).and_return("Y\n")

    subject.install!
  end
  
  context "skipping install" do
    it "should not install the script" do
      output.should_receive(:write).at_least(:once)
      input.should_receive(:gets).and_return("s\n")
      subject.install!
      
      subject.should_not be_installed
    end
  end

  context "confirming install" do
    it "should install the script" do
      output.stub(:write)
      input.stub(:gets).and_return("y\n")
      subject.install!
      
      subject.should be_installed
    end
  end

  context "invalidating install" do
    it "should install the script elsewhere" do
      original_dest = subject.scripts_path
      dest = Dir.mktmpdir
      dest.should_not == original_dest # sanity check
      
      output.stub(:write)
      input.stub(:gets).and_return("n\n", dest, "y\n")
      output.should_receive(:write).with("Please enter the correct install path: ")
      subject.install!
      
      subject.should be_installed(dest)
      subject.should_not be_installed(original_dest)
    end
  end
end
