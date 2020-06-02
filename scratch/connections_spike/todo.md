Übergabe von gestern:
(Was ist implementierungstechnisch passiert)

### Panes:

ToDo:
- [ ] vllt. sinnvollere Positionierung für neu erzeugte Pane als 500 Pixel unter Parentpane
- [ ] alle Panes resizen können?
- [x] register children as listener of vis.
- [x] vis must hold and update State (when applyaction is called)
- [x] create vis.: setData with original data, copy state from parent, applyState
- [x] when selection vis.: register only current vis as listener for control panel
- [ ] when selection vis.: load corresponding state to global control window
- [ ] local controls are hideable