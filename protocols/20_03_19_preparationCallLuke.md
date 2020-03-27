TODO for everyone:
- [] get ready at 09:45 am in our skype group
- [] check title of prototype and add link
- [] make screencast and upload in doc screencasts


Agenda:
- organisational stuff
- research into point display technology
- present prototypes & get feedback
- planning - how should we proceed?

- Catch Up: Our situation homeoffice & full time

- we implemented quite a few prototypes 
- went pretty well 
- bachelor thesis topics were discussed, the whole bachelor procedure started (but covid-19)

- additionally did some technology research (esp. for displaying and animating a lot of points)
      - looked into: three.js, shadama, pixie.js, apartus, shadershop, stack.gl, luma.gl, two.js
      - right now: two ways seem to work well,
          1. regl -> up to 100 000 points without issue
          2. using 2d canvas context => up to 20 000 - 30 000 points

## Prototypes: 
        - Filter-Chain + Selection on individuals as points
        
#### Group-Chaining on individuals as points
This prototype shows the ability to render a nested tree structure as circles with a leaf beeing an individual. One can chain multiple groupings and deselect the last grouping in the chain. This nesting can get quite messy after 3 groupings, so one can interact with the canvas in a dragging and zooming manner.
The prototype can be found [here](https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/groupchaining/regl-group-chain-points.md)
        
        - cross-selecting one individual in two different diagrams on individuals as points
        - map with individuals as points => do you have good geojson data (zones)
        - different panes to work in
        - grouping individuals as points by x- and y-axis

- Our big question: How should we proceed? What is the end goal of this project - a working application for AVF? What should we do in the next weeks? (Just prototype?)