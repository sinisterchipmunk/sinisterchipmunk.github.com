[![screenshot](http://github.com/sinisterchipmunk/jax-dungeon/tree/master/public/screenshot.png)](http://github.com/sinisterchipmunk/jax-dungeon/tree/master/public/screenshot.png)

A demo developed using the Jax WebGL framework (http://github.com/sinisterchipmunk/jax). The core of the demo took
about an hour to write; it took me more time to debug the arched ceilings. A simple cube-shaped dungeon would have
been much easier, but wouldn't have come out looking nearly as nice.

## Features

This demo showcases the following Jax features:
  * texturing
  * normal (bump) mapping
  * multiple light sources
  * keyboard/mouse input handling

## TODO

  * Collision detection. It doesn't seem like it will be too difficult to implement for such a simple demo, and it
    is next on the list.
  * Torch models. Right now, light emanates out of nowhere, which is far from ideal. Torches should line the walls
    to add some visual indication of where the light is coming from.
  * Particle generators. Specifically for the torches along the walls, I'd like to add a fire effect for additional
    eye candy.
  * Doors. I haven't quite figured this one out entirely, yet... but it would be cool to have doors in the dungeon.
    When you click on the door, it... does something. I don't know, maybe takes you to another page, or fires up
    another demo. This is the Web: we can do anything!
    