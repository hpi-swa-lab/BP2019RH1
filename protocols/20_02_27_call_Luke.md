# 27.02.20 Call with Luke

### Visualisation ideas starting from 34

#### 35
- Calibrate start of Shows
- Sms out to previous participants as advert
- practically useful
- Use something like this to monitor traffic during shows
- Have simple bar charts (outgoing, incoming, failing)
- Different data source, reading directly out of rapid pro but same data
- Configuration json file
- Best overlay fit, couple of weeks where shows happened

#### 36
- Swapping by time, theme
- Not by demographic, because that’s distinct, but multiple things might be interesting

#### 37
- Thousand points still making sense?

#### 38
- Dimensionality reduction
- Themes 1 and 4
- Machine learning visualisation
- tsne

#### 39
- Storyboard later

#### 40 
- how to use code as an interaction, liked

###### 41
- Click on ui, change ui and have it change the code
- Points you to sections in code but you have to change it yourself

#### 46
- Non trivial to implement
- Interesting: wizard of oz test
- Someone trying to be the compiler, other one user

- Nicer interaction than commenting and uncommenting
- 41 is interesting contrast
- What would source code look like if we have interaction for turning on and off lines or blocks?

- Same canvas or different canvas for visualisation and code

- How do you host visualisations within code? Similar to Jupyter notebooks

#### 52 
- how to cope with NA, NC
- Two sources of statistical error: missing answers, bias in sample, is for us only error bar of this dataset not for whole population

#### 53 
- with categorical data and see what it looks like

#### 55 
- plot beside it with scale that is not on other diagram
- Design patterns

#### 57 
- like the idea, will it become more clear with real data or more confusing
- Use some real data

#### Further Comments
- Couple of design patterns
- Test a couple of them
- Venn diagram as idea, but going in lose contrast
- Splicing of dots keeps context
- 57 sankey-ish diagram

1. Interacting by manipulating code
2. Keeping context with missing data
3. Keeping history
4. Similarity metrics
5. Dimensionality reduction

- One dot diagram
- One Venn diagram
- Sankey-ish diagram

These three diagram with both design patterns

### Storyboards

#### Fusing diagrams
- Diagram A probably invalid, because people participate multiple times
- Needs data processing to produce correct diagram

#### Individuals overlap
- Wasteful to use random layout for points
- Not doing obvious geolocation
- Demographic distribution
- But likes way of interaction
- New similarity metrics for force layout
- Number of themes that overlapped, relationship good governance and water
- Researcher might be interested in that

#### Mindmap
- Likes to see if this works
- Kinda fun

#### Overlaps 
- Difficulty to explain to not computer scientists
- Re-identify persons through filtering
- Process of constructing one diagram filter by filter would be interesting
- Interesting for researchers

#### Stacked Bars
- Could this be implemented in tableau? Less interested, good idea

#### Display exploration
- Different segmentation forms, overlaps between
- Cross highlighting between different segmentation schemes
- Preferred over first one, keeps history 

#### Further Comments
- Can I have all of this, please?

### Todo

#### Spike
- Performance curve?
- How long does it take to load 100 - 100.000 data points
- Could we load 400.000 data points into that tool?
- When does it stop scaling?

#### Taxonomy
- discuss results at beginning of following week
- Can send over taxonomy for comments

#### raw_messages
- Send example

#### Poster
- blacken e-mails from other employees 
- Send poster

#### World bank reports
- Translated messages
- Send e-mail of reminder of which things he should send us

#### Scheduling
- Write Emma for next meeting scheduling

#### Prototypes in Prototype-Ordner

#### Comments from Patrick and Jens

- Jens:
- Strömen der Pixel, Animationen für Sankee Diagram, Pixel bewegen sich entlang der Linie

- Animationen über Zeit

- Pixel auf Canvas
- Kedama
- Shedama

- Interaktionen über separate Datenstrukturen
- Picking, reverse transformation von Mauskoordinaten zu Objekten
- Zwei Mal rendern, Pixeln Farbe geben, welche Farbe hatte ich denn 
- Selektion über mehrere Diagramme, gleiche Farbe für gleiche Individuen 

- Code provenance
- Nicht lineare Abbildungen, n - m Code zu Visualisierung
- Master-Arbeit, UI ändern und dann ändert sich der Code
- Stephan Tracing, alle Seiteneffekte loggen
- Constraint solver, hill-climbing, programm ändern, sodass er die geänderte Visualisierung wieder darstellt (Carbonite)
- CDG-Demos

- Sachen beschränken, DSL, dann funktionieren Sachen wieder
- Partikel-Simulationen

#### Retro:
- Moderatoren gut
- Luke sagen, was wir wollen
- Jens und Patrick reden danach zu viel
- Mitschreiben aufteilen, vernünftig aufteilen, einer der mitschreibt, was wir ihm schicken sollen
- 5 min Pause direkt nach dem Call
- Zeitplan hätten wir machen können
- Lively-Links richtig schicken