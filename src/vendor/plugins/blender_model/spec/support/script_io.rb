module ScriptIO
  def input
    @input ||= StringIO.new("")
  end
  
  def output
    @output ||= StringIO.new("")
  end
  
  def subject
    @subject ||= Blender::Scripts.new(input, output)
  end
end
