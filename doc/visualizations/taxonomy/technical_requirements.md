<link href="../research-libraries/style.css" rel="stylesheet" type="text/css" />
<link href="style.css" rel="stylesheet" type="text/css" />

# Technical "Taxonomy"

<b style="color:green">bold</b>: Interesting diagram
<i style="color:blue;">italic</i>: good start

For <https://lively-kernel.org/lively4/BP2019RH1/doc/visualization-brainstorming/monday12-16.md>
| Nr Visualization | Technical Components |
| ---------------- | -------------------- |
| 1 | map, word clouds |
| 2 | map, points as individual, shape encoding, color coding, overcrowding / overlapping points strategy |
| <i style="color:blue;">3</i> | display multiple diagrams, multiple scatter plots, selection across diagrams, multiple datapoints selection |
| <i style="color:blue;">4</i> | display text messages, selection across diagrams, display multiple diagrams, connect text message to individual data point |
| 5 | (revised in storyboard) | 
| 6 | graph, points as individual, reordering, node selection |
| 7 | line graph, color coding, time axis |
| 8 | graph, bar chart, transition between views |
| 9 | drag 'n drop selection, group individual datapoints |
| 10 | bar chart, predefined sort and filter, display mini map, guided navigation (arrows etc.) |
| 11 | filter by selection, display all activated filters, return to other set of activated filters by clicking on one | 
| 12 | bar chart nested in bar chart |
| 13 | display processing steps, guided navigation (arrows etc.) | 
| 14 | display processing steps, 2.5D |
| <b style="color:green">15</b> | display data as mindmap / tree, display groupings in middle, drag 'n drop: move groupings around and change mindmap order, overcrowding / overlapping points strategy |
| 16 | graph, drag'n'drop nodes |
| <b style="color:green">17</b> | graph, display messages radially around center message encoding geographical distance or other kind of distance, detect similarity (same theme?) |
| 18 | map, zoom, display different abstractions of messages (plain text, theme, combination of theme) when zooming out |
| <b style="color:green">19</b> | graph, display individuals radially around center message distance encoding "attribute distance", on click: make new individual center |
| <i style="color:blue;"> 20 </i> | play messages as sound, filter messages |
| 21 | play themes as sound, encode amount by volume, display messages |
| 22 | word cloud with themes, display messages |


<b style="color:green">bold</b>: Interesting diagram
<i style="color:blue;">italic</i>: good start

For <https://lively-kernel.org/lively4/BP2019RH1/doc/visualization-brainstorming/january.md>

| Nr Visualization | Technical Components |
| ---------------- | -------------------- |
| 1 | Different visualizations, logging across all interactions, "replay" of log, choosing relevant state of diagram out of log |
| 2 | Different visualizations, display concurrently, link recommendation to visualization, highlighting of visualizations|
| 3 | Presentation of data in vector field, 2D |
| 4 | Screen Capture, Video play, link recommendation recording |
| 5 | Display Themes + Display messages in parallel, sort messages for relevance, display text messages, show messages by theme | 
| <i style="color:blue;"> 6 </i> | 2D, 2 Scatter plots, Points per individual, plot points according to specific category | draw lines across two diagrams, individual across two diagrams |
| 7 | same as 6 with 3 diagrams |
| 8 | 1D, color code on x axis, stable sorted color coding: sort by another attribute, color coding + x axis sorting in new category remains | 
| 9 | Bubble Diagram, clustering: Force according to attribute (e.g. theme) |
| 10 | 2D, Scatter Plot, Drag and drop Selection, Selection of multiple points, Persistence of selection after filter / reorder | 
| 11 | 2D, "Venn Diagram", On Click: Show subset of data in new diagrams | 
| 12 | 2D, Bar Chart, display multiple diagrams, selection/highlighting across diagrams, On Click: Selection of bar, Overlay of bars corresponding individuals in other Chart (sorted with other attributes) / individual across two diagrams | 
| 13 | display multiple diagrams, predefined diagrams for plotting automatically | 
| 14 | 2D, display multiple diagrams, bar chart, pie chart, Fusing of diagrams | 
| 15 | 2D, Line Graph |
| 16 | drag'n'drop selection, stable color coding selection, color coding persistent when reordered / filtered |
| 17 | 2D, Bar Chart, display multiple diagrams, link group of individuals across diagrams, color coding according to amount |
| 18 | 2D, Map, points |
| 19 | 2D, Display multiple diagrams, on Click: exclude, link group of individuals across diagrams |
| 20 | scatter plot, predefined grouping areas, click on button to group individuals automatically |
| 21 | 2D, Display of diagrams, "Similarity detection" |
| 22 | 2D, Bar Chart, calculate bar chart with different angles between x and y axis |
| 23 | 2D, points in plane, position according to different dimensions, axes draggable |
| 24 | 2D, display of attributes, drag 'n drop connection, scatter plot |
| 25 | 2D, vibrating points on selection |
| 26 | 2D, display of diagram / Bar Chart, Drag 'n drop bar / group selection into area, make it disappear from diagram, make column / group selection reappear |
| 27 | 2D, compartments for diagrams, possibility to create new compartments, Display points, "force-grouping", selection across diagrams, visualize order of compartments |
| 28 | individuals as points, drag'n'drop selection, hover: pop-up specific information |
| 29 | Display of diagrams, compartments for content, drag-'n-drop-ability |
| 30 | 2D, Venn diagrams (location according to overlapping (common) individuals) |
| 31 | 2D, get random message from group of data |
| 32 | 2D, text display, connection text elements to more information and from that to code, add new calculation formulas based on data attributes |
| <i style="color:blue;">33</i> | 2D, Bar chart, display multiple diagrams selection/highlighting across diagrams, drag 'n drop diagrams to move |
| 34 | 2D Bar chart |
| 35 | 2D Line chart, time axis |
| 36 | 2D Venn diagram, selection across diagrams|
| 37 | 2D, Graph with message nodes connected to bigger theme nodes |
| 38 | 2D, Force Field |
| 39 | 2D, individuals as points, "show similar" (not similar) groups, "show groups that have no overlap" |
| 40 | 2D, Display diagram, code editor opened with clicked object as "this" context |
| 41 | 2D, Display diagram, display code, disable lines of code |
| 42 | 2D, Display diagram, display code, connection code line display object |
| 43 | 2D, Record state of diagram, display different versions of diagram, display code|
| 44 | 2D, Display diagram, display code, connection display-object and code line(s), interactive change of code (lets just ship lively :D) |
| 45 | 2D, Display diagram, display complete code, connection display-object and code line(s)|
| 46 | text analysis through AI, display correct/relevant code lines, display diagram suggestions |
| 47 | display code, display diagram, information effect of code lines, value assignment as drop down dependent on variable type|
| 48 | display diagram, display code, comments in code |
| 49 | display diagram, on hover: show code, connection code line to display object |
| 50 | Display diagram, code editor opened with clicked object as "this" context, value assignment as drop down dependent on variable type |
| 51 | Display diagram, display corresponding code editor |
| 52 | Bar Chart + "Quartile lines" from box plot (not really quartile lines, assuming min or max values for all NA, NC answers calculate possible extrema) |
| 53 | scatter plot, datapoints with only one value put with random negative value for missing value (within range)  |
| 54 | bar chart |
| 55 | display diagrams, maybe: selection across diagrams |
| 56 | bar chart |
| 57 | line chart (something like a sankey chart), color coding, selection |

## Important components

All listings are in descending order of usage above

#### Basic data manipulations (left out above)
- filter
- group

#### Display elements
- display multiple diagrams
- display raw message(s)
- display code
- display "components"
- display recommendations

#### Metadata / information
- selection across diagrams/elements
  - one individual in multiple diagrams
  - message to individual
  - recommendations to diagram
- connection view object <-> line of code
- similarities between individuals and groups of individuals
- similarities between diagrams

#### Visualizations types
- individuals as points / Scatter plot
- bar chart
- map
- Venn diagram
- mind map
- graph
- line chart
- force field
- "canvas book"

#### Interactions
- drag and drop elements in diagram
- drag and drop diagrams
- selection (click + lasso)

#### Something to think about
- motion (show associations)
- zoom