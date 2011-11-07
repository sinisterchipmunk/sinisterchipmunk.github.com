Jax.getGlobal()['ApplicationController'] = Jax.Controller.create "Application",
  # you can list helpers to be mixed in here, if you like
  helpers: []

  error: (error) ->
    if window._gaq
      _gaq.push ['_trackEvent', 'errors', 'error', error.message]
    false
