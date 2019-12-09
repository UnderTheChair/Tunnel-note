import { drawSocket } from "./socket.io.js";
import { tunnelBox_app } from './tunnelnote_app.js';
import { SERVER_IP } from './config.js'


// Set up mouse events for drawing
let curEndDrawing = false;
let otherEndDrawing = false;
let mousePos = { x: 0, y: 0 };
let ctx = [];
let pdfViewer;
let lastPenMode = 'pen';
let isStylus = false;

var selColor = document.getElementById("selColor");
var color = selColor.value;
var selWidth = document.getElementById("selWidth");
var width = selWidth.value;
var selTransparency = document.getElementById("selTransparency");
var transparency = selTransparency.value;

const BUFFER_SIZE = 1500;

var curScale;
let currentPageNum;

let mousePenEvent = {
  async mouseDown(e) {
    // prevent simultaneous inputs from PC and mobile
    if (otherEndDrawing) return;
    curEndDrawing = true;

    let pdfMousePos;
    let x, y;
    var mode = window.drawService.mode;

    currentPageNum = e.target.getAttribute('data-page-number');

    if(mode !== 'hand')
      lastPenMode = mode;
    if(isStylus)
      mode = lastPenMode;

    mousePos = await getMousePos(e);

    [x, y] = pdfViewer._pages[0].viewport.convertToPdfPoint(mousePos.x, mousePos.y)

    pdfMousePos = { x: x, y: y };

    width = selWidth.value;

    color = selColor.value;
    width = selWidth.value;
    transparency = selTransparency.value;

    if (mode === 'pen')
      startLine(currentPageNum - 1);
    else if (mode === 'eraser')
      eraseLine(currentPageNum - 1);

    drawSocket.emit("MOUSEDOWN", {
      mousePos: pdfMousePos,
      mode: mode,
      color: color,
      width: width,
      transparency: transparency,
      pageNum: currentPageNum,
    })
  }, mouseUp(e) {
    if (otherEndDrawing) return;
    curEndDrawing = false;

    let pageNum = e.target.getAttribute('data-page-number');
    let mode = window.drawService.mode;

    let loadedContext = window.drawService.loadedCanvasList[pageNum - 1];
    loadedContext.stroke();

    if (mode === 'pen' || mode === 'eraser')
      window.drawService.saveCanvas(pageNum);

    drawSocket.emit('MOUSEUP')
  }, async mouseMove(e) {
    if (otherEndDrawing || !curEndDrawing) return;
    let pdfMousePos;
    let x, y;
    let pageNum = e.target.getAttribute('data-page-number');
    var mode = window.drawService.mode;
    if(isStylus)
      mode = lastPenMode;

    if (pageNum !== currentPageNum) {
      return;
    }

    mousePos = await getMousePos(e);

    [x, y] = pdfViewer._pages[0].viewport.convertToPdfPoint(mousePos.x, mousePos.y)

    pdfMousePos = { x: x, y: y };

    drawSocket.emit('MOUSEMOVE', {
      mousePos: pdfMousePos,
      pageNum: pageNum,
      mode: mode
    })

    if (mode === 'pen')
      drawLine(pageNum - 1);
    else if (mode === 'eraser')
      eraseLine(pageNum - 1);
  }
}

// Set up touch events for mobile, etc
let touchPenEvent = {
  async touchStart(e) {
    let canvas = e.target;
    let touch = e.touches[0];
    var mode = window.drawService.mode;

    if(touch.touchType == 'stylus') {
      isStylus = true;
    }

    if (isStylus || mode !== 'hand') { e.preventDefault(); }
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
    var mode = window.drawService.mode;

    if(isStylus) {
      isStylus = false;
    }

    if (mode !== 'hand') { e.preventDefault(); }
    canvas.dispatchEvent(mouseEvent);
  },
  touchMove(e) {
    var mode = window.drawService.mode;
    if (isStylus || mode !== 'hand') { e.preventDefault(); }
    let touch = e.touches[0];
    let canvas = e.target;
    let mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
  }
}

class DrawService {
  constructor(canvasDOMs, pageHeight, pageWidth) {
    this.canvases = canvasDOMs;
    this.canvasLen = canvasDOMs.length;
    // fill loaded canvas image element to this array by loadCanvas()
    this.loadedCanvasList = new Array(this.canvasLen);
    this.mode = 'hand';
    this.pageHeight = pageHeight;
    this.pageWidth = pageWidth;

    ctx = new Array(this.canvasLen);

    /**
     * BUG : handling if curScale is auto
     *
     */
    pdfViewer = window.PDFViewerApplication.pdfViewer;
    curScale = window.PDFViewerApplication.pdfViewer._currentScale;

  }

  async pageRendered(index) {
    await this.reset()
    console.log(`load : ${index}`)

    if (ctx[index]) {

      this.pageHeight = ctx[index].canvas.style.height.split('px')[0];
      this.pageWidth = ctx[index].canvas.style.width.split('px')[0];

      ctx[index].canvas.setAttribute('height', this.pageHeight + 'px');
      ctx[index].canvas.setAttribute('width', this.pageWidth + 'px');

    } else {
      ctx[index] = (this.canvases[index].getContext('2d'));

      if (!this.loadedCanvasList[index]) {
        let canvasEl = document.createElement('canvas');
        let context = canvasEl.getContext('2d');
        canvasEl.width = BUFFER_SIZE;
        canvasEl.height = BUFFER_SIZE;
        this.loadedCanvasList[index] = context;
      }

    }
    let context = this.loadedCanvasList[index];

    if (!context) return;
    ctx[index].drawImage(context.canvas, 0, 0, BUFFER_SIZE, BUFFER_SIZE, 0, 0, this.pageWidth, this.pageHeight);

    curScale = window.PDFViewerApplication.pdfViewer._currentScale
    this.loadedCanvasList[index].setTransform(1, 0, 0, 1, 0, 0);
    this.loadedCanvasList[index].scale(BUFFER_SIZE / this.pageWidth, BUFFER_SIZE / this.pageHeight);
  }

  reset(index) {
    if (ctx[index]) {
      let height = ctx[index].canvas.getAttribute('height').split('px')[0];
      let width = ctx[index].canvas.getAttribute('width').split('px')[0];
      if (height == 0 && width == 0) return;

      console.log(`reset : ${index}`);

      ctx[index].canvas.setAttribute('height', '0px')
      ctx[index].canvas.setAttribute('width', '0px');
    }
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
      if (tool === 'hand') {
        tunnelBox_app.isHandMode = true;
      } else {
        tunnelBox_app.isHandMode = false;
      }
      drawSocket.emit("SETUP");

    }, false)
  }

  saveCanvas(pageNum) {
    let pdfName = localStorage.getItem('pdfName')
    let token = localStorage.getItem('accessToken')

    this.loadedCanvasList[pageNum - 1].canvas.toBlob((blob) => {
      let cvsName = `${pageNum}-cvs.png`
      let formData = new FormData();

      formData.append('cvsFile', blob, cvsName)
      formData.append('pdfName', pdfName)

      fetch(`http://${SERVER_IP}:8000/pdfs/blob/cvs/save/`, {
        method: 'POST',
        headers: new Headers({
          'Authorization': `Bearer ${token}`,
        }),
        body: formData,
      })
        .then(res => res.json())
        .then(res => console.log(res))
    });

  }

  loadCanvas() {
    let pdfName = localStorage.getItem('pdfName')
    let token = localStorage.getItem('accessToken')
    let pdfPageNum = this.canvases.length

    fetch(`http://${SERVER_IP}:8000/pdfs/blob/cvs/load/`, {
      method: 'POST',
      headers: new Headers({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        pdfName: pdfName,
        pdfPageNum: pdfPageNum
      }),
    })
      .then(res => res.json())
      .then(res => {
        let self = this
        for (let i = 0; i < this.canvasLen; i++) {

          let resCvs = res.cvsList[i];
          if (resCvs === null) continue;

          let image = new Image();

          image.src = `data:image/png;base64,${resCvs}`
          let canvasEl = document.createElement('canvas');
          let context = canvasEl.getContext('2d');

          image.onload = function () {
            canvasEl.width = BUFFER_SIZE;
            canvasEl.height = BUFFER_SIZE;
            context.drawImage(image, 0, 0, BUFFER_SIZE, BUFFER_SIZE);
            self.loadedCanvasList[i] = context;
            self.pageRendered(i);
          }
        }
      });
  }
}

function startLine(pageNum) {
  let curContext = ctx[pageNum];
  let loadedContext = window.drawService.loadedCanvasList[pageNum];
  startLineHelper(curContext)
  startLineHelper(loadedContext);
}

function startLineHelper(target) {
  let rate = curScale;

  target.beginPath();
  target.strokeStyle = color;
  target.lineWidth = Math.max((width * rate), 1);
  target.globalAlpha = transparency;
  target.lineJoin = 'round'
  target.lineCap = 'round';
  if (transparency < 1)
    target.globalCompositeOperation = 'xor';
  else
    target.globalCompositeOperation = 'source-over';
  target.moveTo(mousePos.x, mousePos.y);
}
// Draw to the canvas
function drawLine(index) {
  let curContext, loadedContext;

  curContext = ctx[index];
  loadedContext = window.drawService.loadedCanvasList[index];

  curContext.lineTo(mousePos.x, mousePos.y);
  curContext.stroke();

  loadedContext.lineTo(mousePos.x, mousePos.y);
  // loadedContext.stroke();

}

function eraseLine(index) {
  let target = ctx[index];
  let rate = curScale;
  target.beginPath();
  target.globalCompositeOperation = "destination-out";
  target.arc(mousePos.x, mousePos.y, 20 * rate, 0, Math.PI * 2, false);
  target.fill();

  target = window.drawService.loadedCanvasList[index];
  target.beginPath();
  target.globalCompositeOperation = "destination-out";
  target.arc(mousePos.x, mousePos.y, 20 * rate, 0, Math.PI * 2, false);
  target.fill();
}

// Get the position of the mouse relative to the canvas
function getMousePos(mouseEvent) {
  let rect = mouseEvent.target.getBoundingClientRect();

  return {
    x: Math.round(mouseEvent.clientX - rect.left),
    y: Math.round(mouseEvent.clientY - rect.top)
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
  if (curEndDrawing) return;
  let [x, y] = pdfViewer._pages[0].viewport.convertToViewportPoint(data.mousePos.x, data.mousePos.y);

  color = data.color;
  width = data.width;
  transparency = data.transparency;

  mousePos = { x: x, y: y };
  otherEndDrawing = true;

  if (data.mode === 'pen')
    startLine(data.pageNum - 1);
  else if (data.mode === 'eraser')
    eraseLine(data.pageNum - 1);
})

drawSocket.on('MOUSEUP', (data) => {
  if (curEndDrawing) return;
  otherEndDrawing = false;
})

drawSocket.on('MOUSEMOVE', (data) => {
  if (curEndDrawing || !otherEndDrawing) return;
  let [x, y] = pdfViewer._pages[0].viewport.convertToViewportPoint(data.mousePos.x, data.mousePos.y);
  mousePos = { x: x, y: y };
  if (data.mode === 'pen')
    drawLine(data.pageNum - 1);
  else if (data.mode === 'eraser')
    eraseLine(data.pageNum - 1);
})


export {
  DrawService
}
