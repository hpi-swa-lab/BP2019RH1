### Data binding with Shaders 

There seem to be two common ways to implement data binding to displayed objects when working with Shaders:

1. Ray casting
  - using mouse coordinates to check for every single object if the mouse coordinate is on its surface
  - rather complicated when displaying 3D objects (where you need raycasting algorithms)
  - pretty easy (check out regl-select-points) when using simple 2D objects
  
2. "Throwing color into the water" aka Picking
  - Rendering twice and mapping unique color values to each object in the rendered plane that is not visible to the user
  - When clicked on a surface you can then use the unique color in a look-up table to identify the object
  
In Comparison:
  - Ray casting needs linear calculation time each time something is clicked (it needs to check every object if it was clicked)
    - that can be improved by a more sensible way of storing our objects than an array
    - however it works well with simple objects up to 100000 at least
    
  - Picking needs up to quadratic calculation time each time the frame is rendered anew
    - can be optimized by caching and perhaps not assigning every pixel an unique value

- Description of both methods: https://stackoverflow.com/questions/7364693/how-to-get-object-in-webgl-3d-space-from-a-mouse-click-coordinate
- WebGL Guide uses Picking: http://learnwebgl.brown37.net/11_advanced_rendering/selecting_objects.html