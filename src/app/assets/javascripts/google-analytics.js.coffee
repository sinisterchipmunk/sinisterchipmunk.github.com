window._gaq or= []
_gaq.push ['_setAccount', 'UA-24922278-1']
_gaq.push ['_trackPageview']

# Track frame rate, update rate, and duration of visit
# The fps and ups are 5 second moving averages
# the duration should always be reported as 5, such that the sum of all
# durations for any given request is the duration of the visit.
duration = 0
last_duration = 0
fps = 0
ups = 0
count = 0
track_framerate = ->
  setTimeout track_framerate, 1000
  return unless window.context # jax isn't initialized yet?
  
  count++
  duration += Jax.uptime - last_duration
  fps += window.context.getFramesPerSecond()
  ups += window.context.getUpdatesPerSecond()
  last_duration = Jax.uptime
  
  if count >= 5
    _gaq.push ['_trackEvent', 'duration', 'duration', 'duration', duration]
    _gaq.push ['_trackEvent', 'performance', 'framerate', 'framerate', fps / count]
    _gaq.push ['_trackEvent', 'performance', 'update rate', 'update rate', ups / count]
    count = 0
    fps = ups = duration = 0

setTimeout track_framerate, 1000



# other analytics stuff

ga = document.createElement 'script'
ga.type = 'text/javascript'
ga.async = true
if document.location.protocol == 'https:'
  src = 'https://ssl'
else
  src = 'http://www'
ga.src = "#{src}.google-analytics.com/ga.js"
script = document.getElementsByTagName('script')[0]
script.parentNode.insertBefore ga, script
