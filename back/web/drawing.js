import { drawSocket } from "./socket.io.js";
import { tunnelBox_app } from './tunnelnote_app.js';
import { SERVER_IP } from './config.js'

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
const INMEMSIZE = 3000;
var curScale;
let currentPageNum;
var loadingCanvas = false;

Image.prototype.load = function (url) {
  var thisImg = this;
  var xmlHTTP = new XMLHttpRequest();
  xmlHTTP.open('GET', url, true);
  xmlHTTP.responseType = 'arraybuffer';
  xmlHTTP.onload = function (e) {
    var blob = new Blob([this.response]);
    thisImg.src = window.URL.createObjectURL(blob);
    window.PDFViewerApplication.loadingBar.hide();
  };
  xmlHTTP.onprogress = function (e) {
    window.PDFViewerApplication.loadingBar.percent = parseInt((e.loaded / e.total) * 100);
  };
  xmlHTTP.onloadstart = function () {
    window.PDFViewerApplication.loadingBar.percent = 10;
    window.PDFViewerApplication.loadingBar.show();
  };
  xmlHTTP.send();
};

let mousePenEvent = {
  async mouseDown(e) {
    let pdfMousePos;
    let x, y;
    currentPageNum = e.target.getAttribute('data-page-number');
    var mode = window.drawService.mode;

    lastPos = await getMousePos(e);
    isDrawing = true;
    [x, y] = pdfViewer._pages[currentPageNum].viewport.convertToPdfPoint(lastPos.x, lastPos.y)
    pdfMousePos = { x: x, y: y };

    width = document.getElementById("selWidth").value;

    drawSocket.emit("MOUSEDOWN", {
      lastPos: pdfMousePos,
      mode: mode,
      color: color,
      width: width,
      transparency: transparency,
      pageNum: currentPageNum,
    })
  }, mouseUp(e) {
    isDrawing = false;
    let pageNum = e.target.getAttribute('data-page-number');
    let mode = window.drawService.mode;

    if (mode === 'pen' || mode === 'eraser')
      window.drawService.saveCanvas(pageNum);

    drawSocket.emit('MOUSEUP')
  }, async mouseMove(e) {
    if (isDrawing == false) return;
    let pdfMousePos;
    let x, y;
    let pageNum = e.target.getAttribute('data-page-number');

    if (pageNum !== currentPageNum) {
      return;
    }

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

    if (mode !== 'hand') { e.preventDefault(); }
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

    if (mode !== 'hand') {
      e.preventDefault();
    }
    canvas.dispatchEvent(mouseEvent);
  },
  touchMove(e) {
    var mode = window.drawService.mode;
    if (mode !== 'hand') { e.preventDefault(); }
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
    this.pageHeight = pageHeight,
    this.pageWidth = pageWidth,
    
    ctx = new Array(this.canvasLen);
    inMemCtx = new Array(this.canvasLen);
    inMemCanvases = new Array(this.canvasLen);
    
    /**
     * BUG : handling if curScale is auto
     * 
     */
    pdfViewer = window.PDFViewerApplication.pdfViewer;
    curScale = window.PDFViewerApplication.pdfViewer._location.scale;
    
  }

  pageRendered(index) {
    console.log(`load : ${index}`)
    let self = this;
    if (ctx[index]) {
      ctx[index].canvas.setAttribute('height', this.pageHeight+'px');
      ctx[index].canvas.setAttribute('width', this.pageWidth+'px');
      inMemCtx[index].canvas.setAttribute('height', this.pageHeight+'px');
      inMemCtx[index].canvas.setAttribute('width', this.pageWidth+'px');
    } else {
      ctx[index] = (this.canvases[index].getContext('2d'));
      let inMem = document.createElement('canvas');
      inMem.width = this.pageWidth;
      inMem.height = this.pageHeight;
      inMemCtx[index] = inMem.getContext('2d');
      inMemCanvases[index] = inMem;
    }
    let image = this.loadedCanvasList[index];

    if(!image) return;

    image.load(image.src);
    
    image.onload = function () {
      ctx[index].drawImage(image, 0, 0, self.pageWidth, self.pageHeight);
    
      let tf = inMemCtx[index].getTransform()
      inMemCtx[index].setTransform(1, 0, 0, 1, 0, 0);
      inMemCtx[index].drawImage(image, 0, 0);
      inMemCtx[index].setTransform(tf);
    }
  }

  reset(index) {
    if (ctx[index]) {
      console.log(`reset : ${index}`);
      let image = new Image();
      image.src = ctx[index].canvas.toDataURL("image/png");
      this.loadedCanvasList[index] = image;    
      
      ctx[index].canvas.setAttribute('height', '0px')
      ctx[index].canvas.setAttribute('width', '0px');
      inMemCtx[index].canvas.setAttribute('height', '0px')
      inMemCtx[index].canvas.setAttribute('width', '0px');

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
      if (tool !== 'hand') {
        tunnelBox_app.isHandMode = false;
      } else {
        tunnelBox_app.isHandMode = true;
      }
      drawSocket.emit("SETUP");

    }, false)
  }

  updateCanvas() {
    // Unused this function
  }

  saveCanvas(pageNum) {
    let pdfName = localStorage.getItem('pdfName')
    let token = localStorage.getItem('accessToken')

    inMemCanvases[pageNum - 1].toBlob((blob) => {
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

        for (let [i, context] of ctx.entries()) {

          let resCvs = res.cvsList[i];
          if (resCvs === null) continue;
          
          let image = new Image();
          if (!loadingCanvas) {
            // Will manipulate loadingbar
            loadingCanvas = true;
          }
          image.src = `data:image/png;base64,${resCvs}`
          self.loadedCanvasList[i] = image;
        }
      });
  }
}


// Draw to the canvas
function drawLine(pageNum) {
  if (isDrawing) {
    drawLineHelper(ctx[pageNum]);
    drawLineHelper(inMemCtx[pageNum]);
    lastPos = mousePos;
  }
}

function drawLineHelper(ctx) {
  ctx.beginPath();
  var mode = window.drawService.mode;
  let rate = curScale / 100.0;

  if (mode == "pen") {
    ctx.strokeStyle = color;
    ctx.lineWidth = (width * rate);
    ctx.globalAlpha = transparency;
    ctx.lineJoin = ctx.lineCap = 'round';
    ctx.globalCompositeOperation = "source-over";
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(mousePos.x, mousePos.y);
    ctx.stroke();
  } else if (mode == "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.arc(lastPos.x, lastPos.y, 20 * rate, 0, Math.PI * 2, false);
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
  let element = document.getElementsByClassName('penCanvas')[pageNum - 1];
  inMemCanvases[pageNum - 1].width = element.width;
  inMemCanvases[pageNum - 1].height = element.height;
  inMemCtx[pageNum - 1].drawImage(element, 0, 0);

  drawLine(pageNum - 1);
  drawLine(pageNum - 1);
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
