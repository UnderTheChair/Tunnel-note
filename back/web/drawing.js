import { drawSocket } from "./socket.io.js";

// Set up mouse events for drawing
let isDrawing = false;
let mousePos = { x: 0, y: 0 };
let lastPos = mousePos;
let color;
let width;
let transparency
let ctx = [];
let pdfViewer;

let inMemCanvases = [];
let inMemCtx = [];
let INMEMSIZE = 3000;
var curScale;
var inMemScale = {width: 1, height: 1};

let mousePenEvent = {
  async mouseDown(e) {
    let pdfMousePos;
    let x, y;
    let pageNum = e.target.getAttribute('data-page-number');
    var mode = window.drawService.mode;

    lastPos = await getMousePos(e);
    isDrawing = true;
    [x, y] = pdfViewer._pages[pageNum].viewport.convertToPdfPoint(lastPos.x, lastPos.y)
    pdfMousePos = {
      x: x,
      y: y
    };

    drawSocket.emit("MOUSEDOWN", {
      lastPos: pdfMousePos,
      mode: mode,
      color: color,
      width: width,
      transparency: transparency,
      pageNum: e.target.getAttribute('data-page-number')
    })
  }, mouseUp(e) {
    isDrawing = false;
    drawSocket.emit('MOUSEUP')
  }, async mouseMove(e) {
    if(isDrawing == false) return;
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
    drawLine(e.target.getAttribute('data-page-number') - 1);
  }
}

// Set up touch events for mobile, etc
let touchPenEvent = {
  async touchStart(e) {
    let canvas = e.target;
    let touch = e.touches[0];
    var mode = window.drawService.mode;

    if(mode !== 'hand') {
      e.preventDefault();
      mousePos = await getTouchPos(e);
      let mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      canvas.dispatchEvent(mouseEvent);
    }
  },
  touchEnd(e) {
    let canvas = e.target;
    let mouseEvent = new MouseEvent("mouseup", {});
    var mode = window.drawService.mode;

    if(mode !== 'hand') {
      e.preventDefault();
      canvas.dispatchEvent(mouseEvent);
    }
  },
  touchMove(e) {
    var mode = window.drawService.mode;
    if(mode !== 'hand') {
      e.preventDefault();
      let touch = e.touches[0];
      let canvas = e.target;
      let mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      canvas.dispatchEvent(mouseEvent);
    }
  }
}

class DrawService {
  constructor(canvasDOMs) {
    this.canvases = canvasDOMs;
    this.mode = 'hand';
    inMemScale.width = INMEMSIZE/canvasDOMs[0].width;
    inMemScale.height = INMEMSIZE/canvasDOMs[0].height;
    for (let cvs of this.canvases) {
      ctx.push(cvs.getContext('2d'));
      var inMem = document.createElement('canvas');
      inMem.width = INMEMSIZE;
      inMem.height = INMEMSIZE;
      var context = inMem.getContext('2d');
      context.scale(inMemScale.width, inMemScale.height);
      inMemCtx.push(context);
      inMemCanvases.push(inMem);
    }
    pdfViewer = window.PDFViewerApplication.pdfViewer;
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
      window.drawService.mode = tool;
      drawSocket.emit("SETUP");

    }, false)
  }

  updateCanvas() {
    let height = this.canvases[0].height;
    let width = this.canvases[0].width;
    let scaleDelta = window.PDFViewerApplication.pdfViewer._location.scale / curScale;
    curScale = window.PDFViewerApplication.pdfViewer._location.scale;
    for (let i = 0; i < ctx.length; i++) {
      ctx[i].drawImage(inMemCanvases[i], 0, 0, INMEMSIZE, INMEMSIZE, 0, 0, width, height);
      inMemCtx[i].scale(1/scaleDelta, 1/scaleDelta);
    }
  }
}


// Draw to the canvas
function drawLine(pageNum) {
  if(isDrawing) {
    drawLineHelper(ctx[pageNum]);
    drawLineHelper(inMemCtx[pageNum]);
    lastPos = mousePos;
	}
}

function drawLineHelper(ctx) {
  ctx.beginPath();
  var mode = window.drawService.mode;
  if(mode == "pen") {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.globalAlpha = transparency;
    ctx.lineJoin = ctx.lineCap = 'round';
    ctx.globalCompositeOperation="source-over";
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(mousePos.x, mousePos.y);
    ctx.stroke();
  } else if(mode == "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.arc(lastPos.x,lastPos.y,20,0,Math.PI*2,false);
    ctx.fill();
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
  window.drawService.mode = data.mode;
  isDrawing = true;
})

drawSocket.on('MOUSEUP', (data) => {
  isDrawing = false;
})

drawSocket.on('MOUSEMOVE', (data) => {
  let [x, y] = pdfViewer._pages[data.pageNum].viewport.convertToViewportPoint(data.mousePos.x, data.mousePos.y);
  mousePos = { x: x, y: y };
  color = data.color;
  width = data.width;
  transparency = data.transparency;
  //mousePos = data.mousePos;
  let pageNum = data.pageNum;
  let element = document.getElementsByClassName('penCanvas')[pageNum-1];
  inMemCanvases[pageNum-1].width = element.width;
  inMemCanvases[pageNum-1].height = element.height;
  inMemCtx[pageNum-1].drawImage(element, 0, 0);

  drawLine(pageNum-1);
  drawLine(pageNum-1);
  lastPos = mousePos;
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
