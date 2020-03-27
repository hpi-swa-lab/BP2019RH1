import createREGL from "src/external/regl.js"

export class ReGL {
  
  constructor(canvasContext){
    this.regl = createREGL(canvasContext)
    this.fragShader = `
      precision mediump float;
      varying vec4 fragColor;
      void main () {
        float r = 0.0, delta = 0.0, alpha = 1.0;
        vec2 cxy = 2.0 * gl_PointCoord - 1.0;
        r = dot(cxy, cxy);
        if (r > 1.0) {
            discard;
        }
        gl_FragColor = fragColor * alpha;
      }`
    this.vertShaderDraw = `
      precision mediump float;
      attribute vec2 position;
      attribute float pointWidth;
      attribute vec4 color;

      varying vec4 fragColor;
      uniform float stageWidth;
      uniform float stageHeight;

      // helper function to transform from pixel space to normalized
      // device coordinates (NDC). In NDC (0,0) is the middle,
      // (-1, 1) is the top left and (1, -1) is the bottom right.
      // Stolen from Peter Beshai's great blog post:
      // http://peterbeshai.com/beautifully-animate-points-with-webgl-and-regl.html
      vec2 normalizeCoords(vec2 position) {
        // read in the positions into x and y vars
        float x = position[0];
        float y = position[1];

        return vec2(
          2.0 * ((x / stageWidth) - 0.5),
          // invert y to treat [0,0] as bottom left in pixel space
          -(2.0 * ((y / stageHeight) - 0.5)));
      }

      void main () {
        gl_PointSize = pointWidth;
        gl_Position = vec4(normalizeCoords(position), 0, 1);
        fragColor = color;
      }`
    this.vertShaderAnimate = `
      precision mediump float;
      attribute vec2 s_position;
      attribute vec2 t_position;
      attribute float pointWidth;
      attribute vec4 color;

      varying vec4 fragColor;
      uniform float t;
      uniform float stageWidth;
      uniform float stageHeight;

      vec2 normalizeCoords(vec2 position) {
        // read in the positions into x and y vars
        float x = position[0];
        float y = position[1];

        return vec2(
          2.0 * ((x / stageWidth) - 0.5),
          -(2.0 * ((y / stageHeight) - 0.5)));
      }

      void main () {
        gl_PointSize = pointWidth;
        gl_Position = vec4(mix(normalizeCoords(s_position), normalizeCoords(t_position), t), 0, 1);
        fragColor = color;
      }
      `
    
    this.vertShaderAnimateZoomedPoints = `
      precision mediump float;
      attribute vec2 s_position;
      attribute vec2 t_position;
      attribute float s_pointWidth;
      attribute float t_pointWidth;
      attribute vec4 s_color; 
      attribute vec4 t_color;

      varying vec4 fragColor;
      uniform float t;
      uniform mat3 transform;
      uniform float scale;
      uniform float stageWidth;
      uniform float stageHeight;

      vec2 normalizeCoords(vec2 position) {
        // read in the positions into x and y vars
        float x = position[0];
        float y = position[1];

        return vec2(
          2.0 * ((x / stageWidth) - 0.5),
          -(2.0 * ((y / stageHeight) - 0.5)));
      }

      void main () {
        gl_PointSize = scale * float(mix(s_pointWidth, t_pointWidth, t));
        vec3 finalSource = transform * vec3(normalizeCoords(s_position), 1);
        vec3 finalTarget = transform * vec3(normalizeCoords(t_position), 1);
        gl_Position = vec4(mix(finalSource.xy, finalTarget.xy, t), 0, 1);
        fragColor = vec4(mix(s_color[0], t_color[0], t), mix(s_color[1], t_color[1], t), mix(s_color[2], t_color[2], t), mix(s_color[3], t_color[3], t));
      }
      `
    this.vertShaderZoomPoints = `
      precision mediump float;
      attribute vec2 position;
      attribute float pointWidth;
      attribute vec4 color;
      
      varying vec4 fragColor;
      
      uniform mat3 transform;
      uniform float scale;
      uniform vec2 mouse;

      uniform float stageWidth;
      uniform float stageHeight;

      vec2 normalizeCoords(vec2 position) {
        // read in the positions into x and y vars
        float x = position[0];
        float y = position[1];

        return vec2(
          2.0 * ((x / stageWidth) - 0.5),
          // invert y to treat [0,0] as bottom left in pixel space
          -(2.0 * ((y / stageHeight) - 0.5)));
      }

      void main () {
        gl_PointSize = pointWidth * scale;
        vec3 final = transform * vec3(normalizeCoords(position), 1);
        gl_Position = vec4(final.xy, 0, 1);
        fragColor = color;
      }   
    `
    
    this.setUpShader()
    this.setBackgroundColor({r: 255, g: 255, b: 255})
  }
  
  setBackgroundColor(color){
    this.backgroundColor = [color.r/255.0, color.g/255.0, color.b/255.0, 1.0];
  }
  
  setUpShader() {
    this.drawPointsShader = this.regl({
      frag: this.fragShader,
      
      vert: this.vertShaderDraw,
      
      attributes: {
        position: function(context, props) {
          return props.points.map(function(point) {
            return [point.drawing.x, point.drawing.y];
          });
        },
        color: function(context, props) {
          return props.points.map(function(point) {
            let c = point.drawing.color
            return [c.r/255.0, c.g/255.0, c.b/255.0, c.opacity];
          });
        },
        pointWidth: function(context, props) {
          return props.points.map(function(point) {
            return point.drawing.size;
          });
        }
      },

      uniforms: {
        stageWidth: this.regl.context("drawingBufferWidth"),
        stageHeight: this.regl.context("drawingBufferHeight"),
      },

      count: function(context, props) {
        return props.points.length;
      },
      primitive: "points"
    });
    
    this.animateZoomedPointsShader = this.regl({
      frag: this.fragShader,

      vert: this.vertShaderAnimateZoomedPoints,

      attributes: {
        s_position: function(reglContext, props) {
          return props.points.map(function(point) {
            return [point.drawing.sx, point.drawing.sy];
          });
        },
        t_position: function(reglContext, props) {
          return props.points.map(function(point) {
            return [point.drawing.tx, point.drawing.ty];
          });
        },
        s_color: function(reglContext, props) {
          return props.points.map(function(point) {
            let c = point.drawing.scolor
            return [c.r/255.0, c.g/255.0, c.b/255.0, c.opacity];
          });
        },
        t_color: function(reglContext, props) {
          return props.points.map(function(point) {
            let c = point.drawing.tcolor
            return [c.r/255.0, c.g/255.0, c.b/255.0, c.opacity];
          });
        },
        s_pointWidth: function(reglContext, props){
          return props.points.map(function(point) {
            return point.drawing.ssize;
          });
        },
        t_pointWidth: function(reglContext, props){
          return props.points.map(function(point) {
            return point.drawing.tsize;
          });
        }
      },

      uniforms: {
        t: function(context, props) {
          return props.tick;
        },
        transform: function(context, props) {
          return props.transform;
        },
        scale: function(contxt, props) {
          return props.scale;
        },
        stageWidth: this.regl.context("drawingBufferWidth"),
        stageHeight: this.regl.context("drawingBufferHeight")
      },

      count: function(context, props) {
        return props.points.length;
      },
      primitive: "points"
    });
    
    this.animatePointsShader = this.regl({
      frag: this.fragShader,

      vert: this.vertShaderAnimate,

      attributes: {
        s_position: function(reglContext, props) {
          return props.points.map(function(point) {
            return [point.drawing.sx, point.drawing.sy];
          });
        },
        t_position: function(reglContext, props) {
          return props.points.map(function(point) {
            return [point.drawing.x, point.drawing.y];
          });
        },
        color: function(reglContext, props) {
          return props.points.map(function(point) {
            let c = point.drawing.color
            return [c.r/255.0, c.g/255.0, c.b/255.0, c.opacity];
          });
        },
        pointWidth: function(reglContext, props) {
          return props.points.map(function(point) {
            return point.drawing.size;
          });
        }
      },

      uniforms: {
        t: function(context, props) {
          return props.tick;
        },
        stageWidth: this.regl.context("drawingBufferWidth"),
        stageHeight: this.regl.context("drawingBufferHeight")
      },

      count: function(context, props) {
        return props.points.length;
      },
      primitive: "points"
    });
    
    this.drawZoomedPointsShader = this.regl( {
      frag: this.fragShader,
      
      vert: this.vertShaderZoomPoints,
      
      attributes: {
        position: function(context, props) {
          return props.points.map(function(point) {
            return [point.drawing.tx, point.drawing.ty];
          });
        },
        color: function(context, props) {
          return props.points.map(function(point) {
            let c = point.drawing.tcolor
            return [c.r/255.0, c.g/255.0, c.b/255.0, c.opacity];
          });
        },
        pointWidth: function(context, props) {
          return props.points.map(function(point) {
            return point.drawing.tsize;
          });
        }
      },

      uniforms: {
        transform: function(context, props) {
          return props.transform;
        },
        scale: function(contxt, props) {
          return props.scale;
        },
        stageWidth: this.regl.context("drawingBufferWidth"),
        stageHeight: this.regl.context("drawingBufferHeight"),
      },

      count: function(context, props) {
        return props.points.length;
      },
      primitive: "points"
    })
  }
  
  drawPoints(props) {
    this.regl.clear({color: this.backgroundColor})
    this.drawPointsShader(props)
  }
  
  animatePoints(props){
    this.regl.clear({color: this.backgroundColor})
    this.animatePointsShader(props)
  }
  
  drawZoomedPoints(props) {
    this.regl.clear({color: this.backgroundColor})
    this.drawZoomedPointsShader(props)
  }
  
  animateZoomedPoints(props){
    this.animateZoomedPointsShader(props)
  }
}