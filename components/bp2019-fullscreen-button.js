import Morph from 'src/components/widgets/lively-morph.js';

export default class Bp2019FullscreenButton extends Morph {
  async initialize() {
    this.container = lively.query(this, "lively-container")
    this.parents = lively.allParents(this, [], true)

    this.get("#fullscreenButton").addEventListener("click", () => this.toggleFullscreen() )
  }
  
  toggleFullscreen() {
      if (this.container && !this.container.isFullscreen()) {   
          document.body.querySelectorAll("lively-window").forEach(ea => {
          if (!this.parents.includes(ea))  {
            ea.style.display = "none"
          }
        })
        this.container.onFullscreen()
        lively.query(this, "#fullscreenInline").style.display = "none"
        this.dispatchEvent(new CustomEvent("fullscreen-enabled"))
      } else {
        document.body.querySelectorAll("lively-window").forEach(ea => {
          ea.style.display = ""
        })

        document.webkitCancelFullScreen()
        if (this.container && this.container.isFullscreen()) {
          this.container.onFullscreen()
        }
        if (this.container) {
          this.container.parentElement.focus() 
        }
        
        this.dispatchEvent(new CustomEvent("fullscreen-disabled"))
      }
    };  
  
}