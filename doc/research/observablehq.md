# Observablehq

  - create interactive notebooks with graphics using javascript, html and other fun stuff, loading libraries from npm is possible
  
## Example 1: Cartographic Projections 

[Hier geht es zur Grafik](https://observablehq.com/@uwdata/cartographic-visualization)

### Reading the visualization

- Long text above, users would probably not read it
- Introduction explains, that all map projections distort the surface in some way, the graphic serves as a way to experience how different projections work
- First impression: 
    - easy to understand beeing able to look at different types of maps. 
    - Those maps can be altered by parameters, some of which are easy to understand (scale, x, y) and some less easy (pitch, roll). 
    - Invites to play around with the parameters. 
    - There is no explanation what exactly those maps are for

### What kind of visualization

- big picture above showing a (possibly partial) world map according to the projection you can choose by a dropdown menu. 
- map is shown in coordinate system with x, y axis (but in shown picture x, y axis are not visible)
- scrollbars for changing parameters --> cannot type values so it tends to be a test of motor skills

### What data

- data comes from the vega-lite-api

--> Taking a look at the vega-lite-notebook with the same graphic but with more code.
[Vega Lite Cartographic Projections](https://observablehq.com/@vega/vega-lite-cartographic-projections)

- topoJSON, v1 library which is able to create spheres etc.

### Mapping data to visualization

- compiled and automated and little user influence
  - user can choose visual parameters (scale, x, y, roll ...) and which type of projection should be used
  - maps are generated from v1 library, no influence on code or data for that matter (maps are from topoJSON library)
  - no live data

### What kind of interaction for the user

- scrollbars for parameters (scale, x, y)
- dropdown list for map types
- using observablehq notebook javascript editing the base map specification is changeable, but not the projections