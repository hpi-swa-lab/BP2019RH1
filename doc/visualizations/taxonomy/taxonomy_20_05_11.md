| Visualization | Description | Components | Is in All-in-one? | Possible to integrate in Panes? How? | technology used | usable? |
|---------------|-------------|------------|-------------------|--------------------------------------|-----------------|---------|
| Venn | - group by themes <br> - individuals as dots | - statistics widget <br> - local controls: theme select and aggregation, change colors of the groups| yes | | | yes (standalone component) |
| Map | - individuals as dots on a map | - tooltip | yes | | | yes (standalone component)|
| XY Axis | - individuals as dots in a coordinate system <br> - group x axis and y axis by different attributes | - local controls: grouping x and y axis | yes | | | yes (standalone component)|
| Group chaining | - groups in groups represented as circles <br> - individuals as dots | - local controls: grouping, change colors of the groups | kind of | | | no |
| Individual centered (Halo Rings) | - one individual as center <br> - the others grouped as rings around it depending on how many attributes are the same | - two inspectors <br> - local controls: center by theme or by demographics, choose attributes to compare with, tooltip | no | | | yes |
| Anthill | - individuals as dots move between theme bubbles | - local controls: theme selection/parking box, options to change bubble size, movement speed, ...| no | | | yes |
| Individual Forces | - individuals as dots attract each other according to their similarity | - local controls: options to manipulate attraction forces, repulsion, ... | no | | | yes |
| TSNE | - similar to Individual Forces | | no | | | no |
| Polygon Themes Forces | - themes as bubbles are attracted to polygon corners representing attribute values | - local controls: normalize, ... | no | | | yes |
| *Not relevant:* Panes | - data flow from pane to pane <br> - each pane has the ability to manipulate the data | - many different visualizations | no | | | yes |



Things to consider: 
- all visualizations need to receive the data from outside
- support global actions (color, select, filter, inspect, filter/select chain)
- how can local actions be inherited
- representation in a small window
