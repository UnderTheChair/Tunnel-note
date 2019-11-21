import { drawSocket } from "./socket.io.js";

// Set up mouse events for drawing
let drawing = false;
let mousePos = { x: 0, y: 0 };
let lastPos = mousePos;
let mode;
let color;
let width;
let transparency
let ctx = [];
let pdfViewer;

let inMemCanvases = [];
let inMemCtx = [];
var curScale;
var scaleTimestamp = 0;

let mousePenEvent = {
  async mouseDown(e) {
    let pdfMousePos;
    let x, y;
    let pageNum = e.target.getAttribute('data-page-number');


    lastPos = await getMousePos(e);
    drawing = true;

    [x, y] = pdfViewer._pages[pageNum].viewport.convertToPdfPoint(lastPos.x, lastPos.y)
    pdfMousePos = { x: x, y: y };

    drawSocket.emit("MOUSEDOWN", {
      lastPos: pdfMousePos,
      mode: mode,
      color: color,
      width: width,
      transparency: transparency,
      pageNum: e.target.getAttribute('data-page-number')
    })
  }, mouseUp(e) {
    drawing = false;
    drawSocket.emit('MOUSEUP')
    let pageNum = e.target.getAttribute('data-page-number');
    inMemCanvases[pageNum - 1].width = e.target.width;
    inMemCanvases[pageNum - 1].height = e.target.height;
    inMemCtx[pageNum - 1].drawImage(e.target, 0, 0);
  }, async mouseMove(e) {
    if (drawing == false) return;
    let pdfMousePos;
    let x, y;
    let pageNum = e.target.getAttribute('data-page-number');

    mousePos = await getMousePos(e);

    [x, y] = pdfViewer._pages[pageNum].viewport.convertToPdfPoint(mousePos.x, mousePos.y)
    pdfMousePos = { x: x, y: y };

    drawSocket.emit('MOUSEMOVE', {
      mousePos: pdfMousePos,
      color: color,
      width: width,
      transparency: transparency,
      pageNum: e.target.getAttribute('data-page-number')
    })
    renderCanvas(ctx[e.target.getAttribute('data-page-number') - 1]);
  }
}

// Set up touch events for mobile, etc

let touchPenEvent = {
  async touchStart(e) {
    let canvas = e.target;
    let touch = e.touches[0];

    if (mode !== 'hand') e.preventDefault();

    mousePos = await getTouchPos(e);

    let mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
  },
  touchEnd(e) {
    let canvas = e.target;
    let mouseEvent = new MouseEvent("mouseup", {});

    if (mode !== 'hand') e.preventDefault();
    canvas.dispatchEvent(mouseEvent);
  },
  touchMove(e) {
    let touch = e.touches[0];
    let canvas = e.target;
    let mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });

    if (mode !== 'hand') e.preventDefault();
    canvas.dispatchEvent(mouseEvent);
  }
}

class DrawService {
  constructor(canvasDOMs) {
    this.canvases = canvasDOMs;
    for (let cvs of this.canvases) {
      ctx.push(cvs.getContext('2d'));
      var inMem = document.createElement('canvas');
      inMemCtx.push(inMem.getContext('2d'));
      inMemCanvases.push(inMem);
    }
    pdfViewer = window.PDFViewerApplication.pdfViewer;
    $('.penCanvas').attrchange({
      trackValues: true,
      callback: function (e) {
        if (performance.now() - scaleTimestamp > 50) {
          scaleTimestamp = performance.now();
          window.drawService.updateCanvas();
        }
      }
    });
    curScale = window.PDFViewerApplication.pdfViewer._location.scale;
  }
  enableMouseEventListener() {
    for (let cvs of this.canvases) {
      cvs.addEventListener("mousedown", mousePenEvent.mouseDown, false);
      cvs.addEventListener("mouseup", mousePenEvent.mouseUp, false);
      cvs.addEventListener("mousemove", mousePenEvent.mouseMove, false);
    };
  }
  enableTouchEventListener() {
    for (let cvs of this.canvases) {
      cvs.addEventListener("touchstart", touchPenEvent.touchStart, false);
      cvs.addEventListener("touchend", touchPenEvent.touchEnd, false);
      cvs.addEventListener("touchmove", touchPenEvent.touchMove, false);
    };
  }

  registerDrawToolButton(btn, tool) {
    btn.addEventListener("click", (e) => {
      mode = tool;
      drawSocket.emit("SETUP");

    }, false)
  }

  updateCanvas() {
    for (let i = 0; i < ctx.length; i++) {
    let scaleDelta = window.PDFViewerApplication.pdfViewer._location.scale / curScale;
    ctx[i].scale(scaleDelta, scaleDelta);
    ctx[i].drawImage(inMemCanvases[i], 0, 0);
    }
  }
}


// Draw to the canvas
function renderCanvas(ctx) {

  if (drawing) {

    ctx.beginPath();

    if (mode == "pen") {

      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.globalAlpha = transparency;

      ctx.lineJoin = ctx.lineCap = 'round';
			ctx.globalCompositeOperation="source-over";
			ctx.moveTo(lastPos.x, lastPos.y);
			ctx.lineTo(mousePos.x, mousePos.y);
			ctx.stroke();
		}
		else if(mode == "eraser"){
			ctx.globalCompositeOperation = "destination-out";
			ctx.arc(lastPos.x,lastPos.y,20,0,Math.PI*2,false);
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

// Get the position of a touch relative to the canvas
function getTouchPos(touchEvent) {
  let rect = touchEvent.target.getBoundingClientRect();

  return {
    x: touchEvent.touches[0].clientX - rect.left,
    y: touchEvent.touches[0].clientY - rect.top
  };
}

drawSocket.on('MOUSEDOWN', (data) => {
  let [x, y] = pdfViewer._pages[data.pageNum].viewport.convertToViewportPoint(data.lastPos.x, data.lastPos.y);
  let selColor = document.getElementById("selColor");
  let selWidth = document.getElementById("selWidth");
  let selTransparency = document.getElementById("selTransparency");

  selColor.value = data.color;
  selWidth.value = data.width;
  selTransparency.value = data.transparency;

  lastPos = { x: x, y: y };

  //lastPos = data.lastPos;
  mode = data.mode;
  drawing = true;
})

drawSocket.on('MOUSEUP', (data) => {
  drawing = false;
})

drawSocket.on('MOUSEMOVE', (data) => {
  let [x, y] = pdfViewer._pages[data.pageNum].viewport.convertToViewportPoint(data.mousePos.x, data.mousePos.y);
  mousePos = { x: x, y: y };
  color = data.color;
  width = data.width;
  transparency = data.transparency;
  //mousePos = data.mousePos;
  let pageNum = data.pageNum;
  let element = document.getElementsByClassName('penCanvas')[pageNum - 1];
  inMemCanvases[pageNum - 1].width = element.width;
  inMemCanvases[pageNum - 1].height = element.height;
  inMemCtx[pageNum - 1].drawImage(element, 0, 0);

  renderCanvas(ctx[pageNum - 1]);
})

var selColor = document.getElementById("selColor");
color = selColor.value;

var selWidth = document.getElementById("selWidth");
color = selWidth.value;

var selTransparency = document.getElementById("selTransparency");
transparency = selTransparency.value;

selColor.onchange = function (e) {
  color = selColor.value;
}

selWidth.onchange = function (e) {
  width = selWidth.value;
}

selTransparency.onchange = function (e) {
  transparency = selTransparency.value;
}

export {
  DrawService
}
