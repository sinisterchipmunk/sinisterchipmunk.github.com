require 'spec_helper'
require 'stringio'

describe "merge-assets script" do
  SPEC_PATH = File.expand_path("merge-assets-tmp", File.dirname(__FILE__))

  def out
    @out ||= StringIO.new("")
  end
  
  before(:each) {
    FileUtils.mkdir_p File.join(SPEC_PATH, "src/appname/pkg")
    FileUtils.touch   File.join(SPEC_PATH, "src/appname/pkg/file.1")
  }
  after(:each) { FileUtils.rm_rf SPEC_PATH }
  
  subject do
    Merger.new(SPEC_PATH, "src/*/pkg/**/*", "src\\/(.*?)\\/pkg", @clean)
  end
  
  context "with a clean system" do
    it "should copy the file" do
      subject.start(out)
      File.should exist(File.join(SPEC_PATH, "file.1"))
    end
    
    context "cleaning" do
      before(:each) { @clean = true }
      
      it "should be missing" do
        subject.start(out)
        out.string.should =~ /missing/i
      end
    end
  end
  
  context "with a dirty system" do
    before(:each) { subject.start(nil) }
    
    it "should produce a warning" do
      subject.start(out)
      out.string.should =~ /warning/i
    end

    context "cleaning" do
      it "should be removed" do
        subject.clean = true
        subject.start(out)
        out.string.should =~ /removing/i
      end
    end
  end
end
