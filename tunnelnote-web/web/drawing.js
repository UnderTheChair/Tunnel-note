import { drawSocket } from "./socket.io.js";


// Set up mouse events for drawing
let drawing = false;
let mousePos = { x: 0, y: 0 };
let lastPos = mousePos;
let mode;
let ctx = [];

let inMemCanvases = [];
let inMemCtx = [];
var curScale;
var scaleTimestamp = 0;

let mousePenEvent = { 
  mousedown(e) {
    lastPos = getMousePos(e);
    drawing = true;

    drawSocket.emit(
      "MOUSEDOWN", {
        lastPos: lastPos,
		mode: mode,
		pageNum: e.target.getAttribute('data-page-number')
      }
    )
  }, mouseup(e) {
    let pageNum = e.target.getAttribute('data-page-number');
    drawing = false;
    drawSocket.emit('MOUSEUP')
    inMemCanvases[pageNum-1].width = e.target.width;
    inMemCanvases[pageNum-1].height = e.target.height;
    inMemCtx[pageNum-1].drawImage(e.target, 0, 0);
  }, mousemove(e) {
	if(drawing == false) return;
    mousePos = getMousePos(e)
    drawSocket.emit('MOUSEMOVE', {
      mousePos: mousePos,
      pageNum: e.target.getAttribute('data-page-number')-1
    })
    renderCanvas(ctx[e.target.getAttribute('data-page-number')-1]);
  }
}

class DrawService {
  constructor(canvasDOMs) {
    this.canvases = canvasDOMs;
    for(let cvs of this.canvases) {
      ctx.push(cvs.getContext('2d'));
      var inMem = document.createElement('canvas');
      inMemCtx.push(inMem.getContext('2d'));
      inMemCanvases.push(inMem);
    }
    $('.penCanvas').attrchange({
      trackValues: true,
      callback: function (e) { 
        if(performance.now() - scaleTimestamp > 50) {
          scaleTimestamp = performance.now();
          console.log('scaling')
          for(let i = 0; i < ctx.length; i++) {
            let scaleDelta = window.PDFViewerApplication.pdfViewer._location.scale/curScale; 
            ctx[i].scale(scaleDelta, scaleDelta);
            ctx[i].drawImage(inMemCanvases[i], 0, 0);
          }
        }
      }
    });
    curScale = window.PDFViewerApplication.pdfViewer._location.scale;
  }
  enableMouseEventListener() {
    for(let cvs of this.canvases) {
      cvs.addEventListener("mousedown", mousePenEvent.mousedown, false);
      cvs.addEventListener("mouseup", mousePenEvent.mouseup, false);
      cvs.addEventListener("mousemove", mousePenEvent.mousemove, false);
    };
  }

  registerDrawToolButton(btn, tool) {
    btn.addEventListener("click", (e) => {
      mode = tool;
    }, false)
  }
}


// Draw to the canvas
function renderCanvas(ctx) {
  if (drawing) {
    ctx.beginPath();

    if (mode == "pen") {
      //ctx.strokeStyle = <line color>;
      //ctx.lineWidth = <line width>;
      ctx.globalCompositeOperation = "source-over";
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(mousePos.x, mousePos.y);
      ctx.stroke();
    } else if (mode == "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.arc(lastPos.x, lastPos.y, 20, 0, Math.PI * 2, false);
      ctx.fill();
    }
    lastPos = mousePos;
  }
}

// Get the position of the mouse relative to the canvas
function getMousePos(mouseEvent) {
  let rect = mouseEvent.target.getBoundingClientRect();

  return {
    x: mouseEvent.clientX - rect.left,
    y: mouseEvent.clientY - rect.top
  };
}

drawSocket.on('MOUSEDOWN', (data) => {
  lastPos = data.lastPos;
  mode = data.mode;
  drawing = true;
})

drawSocket.on('MOUSEUP', (data) => {
  drawing = false;
})

drawSocket.on('MOUSEMOVE', (data) => {
  mousePos = data.mousePos;
  let pageNum = data.pageNum;
  renderCanvas(ctx[pageNum - 1]);
})
// TODO : Mobile code on below

// Set up touch events for mobile, etc
/*
canvas.addEventListener("touchstart", function (e) {
	mousePos = getTouchPos(canvas, e);
	let touch = e.touches[0];
	let mouseEvent = new MouseEvent("mousedown", {
		clientX: touch.clientX,
		clientY: touch.clientY
	});
	canvas.dispatchEvent(mouseEvent);
}, false);
canvas.addEventListener("touchend", function (e) {
	let mouseEvent = new MouseEvent("mouseup", {});
	canvas.dispatchEvent(mouseEvent);
}, false);
canvas.addEventListener("touchmove", function (e) {
	let touch = e.touches[0];
	let mouseEvent = new MouseEvent("mousemove", {
		clientX: touch.clientX,
		clientY: touch.clientY
	});
	canvas.dispatchEvent(mouseEvent);
}, false);


// Get the position of a touch relative to the canvas
function getTouchPos(canvasDom, touchEvent) {
	let rect = canvasDom.getBoundingClientRect();
	return {
		x: touchEvent.touches[0].clientX - rect.left,
		y: touchEvent.touches[0].clientY - rect.top
	};
}
*/

export {
    DrawService
}