<!-- markdown-config presentation=true -->
<link rel="stylesheet" type="text/css" href="./style.css"  />

<script>
import Presentation from "src/components/widgets/lively-presentation.js"
Presentation.config(this, {
    pageNumbers: true,
    logo: "https://lively-kernel.org/lively4/lively4-seminars/PX2018/media/hpi_logo.png"
})
</script>


<div class="title">
  BP2019RH1 - Project Partner Visit
</div>

<div class="authors">
  Wanda Baltzer, Theresa Hradilak, Lara Pfennigschmidt, Luc Prestin, Moritz Spranger, Simon Stadlinger, Leo Wendt
</div>

<div class="credentials">
  2019<br>
  <br>
  Software Architecture Group <br>Hasso Plattner Institute<br> University of Potsdam, Germany
</div>

---

# Welcome back

![](pictures/team.jpeg){width="650" style="display: block;margin-left: auto; margin-right: auto; width: 70%;"}

---

# What is our project about again?
<div align="center"><img src="pictures/africas-voices-logo-pad.svg" alt="drawing" width="400"/></div>

- Get **public opinion** polls where getting representative data from citizens is hard 
- People responding with SMS to questions asked on radio show
- Africa's Voices:
  - compiles, translates and aggregates responses
  - uses that data to **inform policy makers**
- And we?
  - **generate visualizations** that can help understand and 
    **explore** the obtained qualitative data 

---
# We had a visit
- Week before last week Luke (our project partner) visited the Fachgebiet
<img src="pictures/lukeChurch.png" height="350"/> 


---

# What we thought our goals were going to be


### Africa's Voices Researcher
Goal => Help to ease their process
1. Generate diagrams automatically.
2. Generate explorable diagrams.
3. Generate explorable diagrams to answer emerging questions.

### Africa's Voices Policy maker
Goal => Provide valuable information for decision making 
![](pictures/stakeholder_av.png){ style="float:right" alt="drawing" width="280"}
1. Build a tool to show data to policy makers.
2. Explore with policy maker / let policy maker explore.
3. Answer questions that emerge during exploration.



---

# What we think our goals are going to be now

0. **Understand** provided data / domain 
1. **Brainstorm** / Design visualizations (a lot of them)
  - Unconventional
  - Explorable
  - Individual-centered
  - No completeness of data
2. **Implement** the best ideas

(3. Synthesize similarities into a framework)

---

# We have data

- Data privacy agreement
- Two files in JSON format
  - Messages (1.2 GB)
  - Individuals (1 GB) 
- Each line in data files represents an individual/message => provenance
- Nested structure to show merge with other tracedata
- Objects contain:
  - raw data (responses and personal information)
  - coding of responses
  - processing metadata
---

# We are working on workflows


![](pictures/12-11serverArchitecture.png){style="display: block;margin-left: auto; margin-right: auto; width: 75%;"}

---

# We are working on workflows    

![](pictures/12-11workflow.png){style="display: block;margin-left: auto; margin-right: auto; width: 70%;"}

---


# We have done research
### Literature/Books
The Functional Art - Alberto Cairo (Leo)

The Truthful Art - Alberto Cairo (Wanda)
- "Getting the information as right as possible comes first"
- "Show a summary first, but also let people explore as many layers of depth and breadth as is appropriate"

A Small Matter Of Programming - Bonnie A. Nardi (Simon, Moe)

Factfulness - Hans Rosling

---

# We have done research
### Literature/Books
The Design of everyday Things - Donald A. Norman (Luc)

Information is Beautiful - David McCandless (Lara)

Unflattening - Nick Sousanis (Lara)

Things come apart - Todd McLellan (Lara)

---

# We have done research
### Papers
The Gamma: Programming tools for open data-driven storytelling
- Treating data visualizations as scripts, as reproducible programs
- Offering methods to construct query which will produce visualization

The Practices of Programming - Ilias Bergström, Alan F. Blackwell

Herding Cats: Observing Live Coding in the Wild - Thor Magnusson

Incremental Relational Lenses - Rudi Horn, Roly Perera, James Cheney

Exploratory and Live, Progamming and Coding - SWA Lehrstuhl

---


# We have a couple of ideas
- Sketch ideas for diagrams
- **Design Thinking** workshop to get new ideas, creative session
- Collect a list of "parameters"
  - Elements to use in visualizations
  - Interactions
- Get more **input**, more interesting books or papers


