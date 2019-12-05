import { drawSocket } from "./socket.io.js";
import { tunnelBox_app } from './tunnelnote_app.js';

// Set up mouse events for drawing
let isDrawing = false;
let mousePos = { x: 0, y: 0 };
let lastPos = mousePos;
let color;
let width;
let transparency
let ctx = [];
let pdfViewer;

//형광펜 기능 추가변수
let points = [];
let erase_pt = [];
let isDown = false;
let isStart = false;
let erase_x;
let erase_y;



let inMemCanvases = [];
let inMemCtx = [];
const INMEMSIZE = 3000;
var curScale;
let currentPageNum;
var loadingCanvas = false;

Image.prototype.load = function(url){
  var thisImg = this;
  var xmlHTTP = new XMLHttpRequest();
  xmlHTTP.open('GET', url,true);
  xmlHTTP.responseType = 'arraybuffer';
  xmlHTTP.onload = function(e) {
    var blob = new Blob([this.response]);
    thisImg.src = window.URL.createObjectURL(blob);
    window.PDFViewerApplication.loadingBar.hide();
  };
  xmlHTTP.onprogress = function(e) {
    window.PDFViewerApplication.loadingBar.percent = parseInt((e.loaded / e.total) * 100);
  };
  xmlHTTP.onloadstart = function() {
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
    let xy_loc; //형광펜 교정 x,y축 
    let erase_xy;
    var mode = window.drawService.mode;
    //mouse down 하면 지움
    if(mode == "pen") points = [];

    lastPos = await getMousePos(e);
    isDrawing = true;
    [x, y] = pdfViewer._pages[currentPageNum].viewport.convertToPdfPoint(lastPos.x, lastPos.y)
    pdfMousePos = { x: x, y: y };
    xy_loc = {x:e.offsetX, y:e.offsetY, isStart:true};
    erase_x = e.offsetX;
    erase_y = e.offsetY;

    // console.log(mode + "down");
    //console.log(xy_loc);


    
    drawSocket.emit("MOUSEDOWN", {
      lastPos: pdfMousePos,
      lastPos: xy_loc,
      mode: mode,
      color: color,
      width: width,
      transparency: transparency,
      pageNum: currentPageNum,
    })
    
    if(mode == "pen") points.push(xy_loc);
    else if (mode == "eraser") {
      erase_xy = {x:e.offsetX, y:e.offsetY, isStart:true};
      erase_pt.push(erase_xy);
    }
    isDown = true;


  }, mouseUp(e) {
    var mode = window.drawService.mode;
    // var h = this.canvases[0].height;
    // var w = this.canvases[0].width;
    isDown = false;
    isDrawing = false;
    let pageNum = e.target.getAttribute('data-page-number');
    let scaleDelta = window.PDFViewerApplication.pdfViewer._location.scale / curScale;
    curScale = window.PDFViewerApplication.pdfViewer._location.scale;
    window.drawService.saveCanvas(pageNum);
  
    drawSocket.emit('MOUSEUP')
    if(mode == "pen"){

      console.log("drawing");
      for (let i = 0; i < ctx.length; i++) {
        console.log("sumin");
        ctx[i].drawImage(inMemCanvases[i], 0, 0, INMEMSIZE, INMEMSIZE, 0, 0, ctx[i].canvas.width, ctx[i].canvas.height);
        // ctx[i].drawImage(inMemCanvases[i], 0, 0, INMEMSIZE, INMEMSIZE, 0, 0, ctx[i].canvas.width, ctx[i].canvas.height);
        // inMemCtx[i].scale(1/scaleDelta, 1/scaleDelta);
        let tf = inMemCtx[i].getTransform();
        inMemCtx[i].setTransform(1, 0, 0, 1, 0, 0);
        inMemCtx[i].drawImage(inMemCanvases[i], 0, 0);
        inMemCtx[i].setTransform(tf);
      }
      reredrawAll(inMemCtx[pageNum-1]);

      // ctx[pageNum].drawImage(inMemCtx[pageNum], 0,0);
    }
    // if (mode == "pen") {
    //   console.log("test");
    //   window.drawService.updateCanvas();r
    //   // for (let i =0;i<ctx.length;i++){
    //   //   console.log("forforfor");
    //   //   ctx[i].drawImage(inMemCtx[i], 0,0,INMEMSIZE,INMEMSIZE, 0, 0, this.canvases[0].width, this.canvases[0].height);
    //   // }
    //   // redrawAll(inMemCtx[pageNum]);

    // }
  
    // console.log("sumin");


    if(mode == "eraser") erase_pt = [];
    
    
    // else if(mode == "pen"){
    //   console.log("imstart");
    //   // for (let i =0;i<ctx.length;i++){
    //   //   console.log("forforfor");
    //   //   ctx[i].drawImage(inMemCtx[i], 0,0,INMEMSIZE,INMEMSIZE, 0, 0, w, h);
    //   // }
    //   redrawAll(inMemCtx[pageNum]);
    //   console.log("redraw");

    //   // let scaleDelta = window.PDFViewerApplication.pdfViewer._location.scale / curScale;
    //   // curScale = window.PDFViewerApplication.pdfViewer._location.scale;
      
    //   // let pageNum = e.target.getAttribute('data-page-number');
    //   // let element = document.getElementsByClassName('penCanvas')[pageNum-1];
    //   // inMemCanvases[pageNum-1].width = element.width;
    //   // inMemCanvases[pageNum-1].height = element.height;
    //   // inMemCtx[pageNum-1].drawImage(element, 0, 0);
    //   // console.log("for문 전");

    //   // for (let i = 0; i < ctx.length; i++) {
    //   //   console.log("sumin");
    //   //   ctx[i].drawImage(inMemCanvases[i], 0, 0, INMEMSIZE, INMEMSIZE, 0, 0, ctx[i].canvas.width, ctx[i].canvas.height);
    //   //   inMemCtx[i].scale(1/scaleDelta, 1/scaleDelta);
    //   // }

    //   // points = [];
    // }


  }, async mouseMove(e) {
    if(isDrawing == false) return;
    let pdfMousePos;
    let x, y;
    let pageNum = e.target.getAttribute('data-page-number');
    let xy_loc;
    let erase_xy;
    var mode = window.drawService.mode;

    if(isDown !== false){

    if(pageNum !== currentPageNum){
      return;
    }

    mousePos = await getMousePos(e);

    [x, y] = pdfViewer._pages[pageNum].viewport.convertToPdfPoint(mousePos.x, mousePos.y)
    pdfMousePos = { x: x, y: y };
    xy_loc = {x:e.offsetX, y:e.offsetY, isStart:false};
    erase_x = e.offsetX;
    erase_y = e.offsetY;
    // console.log(xy_loc);

    // console.log(mode + "move");

    drawSocket.emit('MOUSEMOVE', {
      mode : mode,
      // mousePos: xy_loc,
      mousePos: pdfMousePos,
      color: color,
      width: width,
      transparency: transparency,
      pageNum: e.target.getAttribute('data-page-number')
    })
    
    if(mode == "pen") {
      points.push(xy_loc);
      redrawAll(ctx[e.target.getAttribute('data-page-number') - 1]);
    }

    else if (mode == "eraser") {
      erase_xy = {x:e.offsetX, y:e.offsetY, isStart:false};
      erase_pt.push(erase_xy);
      eraseAll(ctx[e.target.getAttribute('data-page-number') - 1]);
      // for(var i =0;i<erase_pt.length;i++){
      //   for(var j =0;j<points.length;j++){
      //     if(erase_pt[i] == points[j]){
      //       console.log("dd");
      //       points.slice(j, 1);
      //     }
      //   }
      // }
    }

  }
  //실제canvas redrawall
    // drawLine(e.target.getAttribute('data-page-number') - 1);
  }
}

// Set up touch events for mobile, etc
let touchPenEvent = {
  async touchStart(e) {
    let canvas = e.target;
    let touch = e.touches[0];
    var mode = window.drawService.mode;

    if(mode !== 'hand') { e.preventDefault(); }
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

    if(mode !== 'hand') {
      e.preventDefault();
    }
    canvas.dispatchEvent(mouseEvent);
  },
  touchMove(e) {
    var mode = window.drawService.mode;
    if(mode !== 'hand') { e.preventDefault(); }
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
  constructor(canvasDOMs) {
    this.canvases = canvasDOMs;
    this.mode = 'hand';
    for (let cvs of this.canvases) {
      ctx.push(cvs.getContext('2d'));
      var inMem = document.createElement('canvas');
      inMem.width = INMEMSIZE;
      inMem.height = INMEMSIZE;
      var context = inMem.getContext('2d');
      context.scale(INMEMSIZE/canvasDOMs[0].width, INMEMSIZE/canvasDOMs[0].height);
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
      if(tool !== 'hand'){
        tunnelBox_app.isHandMode = false;
      }else{
        tunnelBox_app.isHandMode = true;
      }
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

  saveCanvas(pageNum) {
    let pdfName = localStorage.getItem('pdfName')
    let token = localStorage.getItem('accessToken')

    inMemCanvases[pageNum-1].toBlob((blob) => {
      let cvsName = `${pageNum}-cvs.png`
      let formData = new FormData();

      formData.append('cvsFile', blob, cvsName)
      formData.append('pdfName', pdfName)

      fetch(`http://localhost:8000/pdfs/blob/cvs/save/`, {
        method : 'POST',
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

    fetch(`http://localhost:8000/pdfs/blob/cvs/load`, {
      method : 'POST',
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
      for(let [i, context] of ctx.entries()) {

        let resCvs = res.cvsList[i];
        if(resCvs === null) continue;

        let image = new Image();
        if(!loadingCanvas) {
          // Will manipulate loadingbar
          image.load(`data:image/png;base64,${resCvs}`);
          loadingCanvas = true;
        }
        else image.src = `data:image/png;base64,${resCvs}`

        image.onload = function() {
          context.drawImage(image, 0, 0, self.canvases[0].width, self.canvases[0].height);
          let tf = inMemCtx[i].getTransform()
          inMemCtx[i].setTransform(1, 0, 0, 1, 0, 0);
          inMemCtx[i].drawImage(image, 0, 0);
          inMemCtx[i].setTransform(tf);
        }
      }
    });
  }
}

function redrawAll(ctx){
  ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);
  ctx.beginPath();
  // ctx.strokeStyle = "black";
  ctx.strokeStyle = color;

  ctx.lineWidth = width;
  ctx.linejoin = 'round';
  ctx.lineCap = 'round';
  ctx.globalAlpha = transparency;
  // console.log(ctx.globalAlpha);
  ctx.globalCompositeOperation="source-over";
  points.forEach(function(pt) {
    if(pt.isStart){
      ctx.stroke();
      ctx.beginPath();
    }
    ctx.lineTo(pt.x, pt.y);
  });
  ctx.stroke();
  // ctx.strokeStyle = color;

}

function reredrawAll(ctx){
  var mode = window.drawService.mode;
  if(mode == "pen"){
  ctx.save();
  // ctx.strokeStyle = "black";
  ctx.strokeStyle = color;

  ctx.lineWidth = width;
  ctx.linejoin = 'round';
  ctx.lineCap = 'round';
  ctx.globalAlpha = transparency;
  // console.log(ctx.globalAlpha);
  ctx.globalCompositeOperation="source-over";
  points.forEach(function(pt) {
    if(pt.isStart){
      ctx.beginPath();
    }
    ctx.lineTo(pt.x, pt.y);
  });
  ctx.stroke();
  ctx.restore();
  // ctx.strokeStyle = color;
  }
  else if(mode == "eraser"){
    console.log("erase");
    ctx.clearRect(erase_x-width,erase_y-width, 2*width, 2*width);
    ctx.beginPath();
    // ctx.strokeStyle = "black";
    ctx.strokeStyle = "white";

    ctx.lineWidth = width;
    ctx.linejoin = 'round';
    ctx.lineCap = 'round';
    ctx.globalAlpha = transparency;
    // console.log(ctx.globalAlpha);
    ctx.globalCompositeOperation="destination-out";
    points.forEach(function(pt) {
      if(pt.isStart){
        ctx.stroke();
        ctx.beginPath();
      }
      ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();
    // ctx.strokeStyle = color;
    }
  }


function eraseAll(ctx){
  console.log("본 지우개");
  // ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);
  ctx.clearRect(erase_x-width,erase_y-width, 2*width, 2*width);
  ctx.beginPath();
  // ctx.strokeStyle = "white";
  ctx.strokeStyle = color;

  ctx.lineWidth = width;
  ctx.linejoin = 'round';
  ctx.lineCap = 'round';
  ctx.globalAlpha = transparency;
  ctx.globalCompositeOperation="destination-out";
  erase_pt.forEach(function(pt) {
    if(pt.isStart){
      ctx.stroke();
      ctx.beginPath();
    }
    ctx.lineTo(pt.x, pt.y);
  });
  ctx.stroke();
  ctx.strokeStyle = color;

}



// Draw to the canvas
function drawLine(pageNum) {
  if(isDrawing) {
    // console.log("start");
    // redrawAll(ctx[pageNum]);
    drawLineHelper(ctx[pageNum]);
    drawLineHelper(inMemCtx[pageNum]);
    // drawLineHelper(ctx[pageNum]);
    // drawLineHelper(inMemCtx[pageNum]);
    lastPos = mousePos;
	}
}

function drawLineHelper(ctx) {
  ctx.beginPath();
  var mode = window.drawService.mode;
  if(mode == "pen") {
    if(ctx.globalAlpha == 1){
      //기존코드
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.globalAlpha = transparency;
      ctx.lineJoin = ctx.lineCap = 'round';
      ctx.globalCompositeOperation="source-over";
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(mousePos.x, mousePos.y);
      ctx.stroke();
    }
    else{
      //내코드
      redrawAll(ctx);
    }
 
  } else if(mode == "eraser") {
    //내코드
    // ctx.clearRect(erase_x-width,erase_y-width, 2*width, 2*width);
    // eraseAll(ctx);
    //기존코드
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
  console.log("mousedown");

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

drawSocket.on('MOUSEOUT', (data) => {
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
