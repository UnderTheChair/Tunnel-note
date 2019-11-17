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

let mousePenEvent = {
  async mousedown(e) {
    let pdfMousePos;
    let x,y;
    let pageNum = e.target.getAttribute('data-page-number');

    lastPos = await getMousePos(e);
    drawing = true;
    
    [x,y] = pdfViewer._pages[pageNum].viewport.convertToPdfPoint(lastPos.x, lastPos.y)
    pdfMousePos = {x: x, y: y};
    
    drawSocket.emit("MOUSEDOWN", {
      lastPos: pdfMousePos,
		  mode: mode,
		  pageNum: e.target.getAttribute('data-page-number')
    })
  }, mouseup(e) {
    drawing = false;
    drawSocket.emit('MOUSEUP')
  }, async mousemove(e) {
	  if(drawing == false) return;
    let pdfMousePos;
    let x,y;
    let pageNum = e.target.getAttribute('data-page-number');
    
    mousePos = await getMousePos(e);
  
    [x,y] = pdfViewer._pages[pageNum].viewport.convertToPdfPoint(mousePos.x, mousePos.y)
    pdfMousePos = {x: x, y: y};
    
    drawSocket.emit('MOUSEMOVE', {
	  mousePos: pdfMousePos,
	  pageNum: e.target.getAttribute('data-page-number')
    })
    renderCanvas(ctx[e.target.getAttribute('data-page-number') - 1]);
  }
}

class DrawService {
  constructor(canvasDOMs) {
    this.canvases = canvasDOMs;
    for(let cvs of this.canvases) {
      ctx.push(cvs.getContext('2d'));
    }
    pdfViewer = window.PDFViewerApplication.pdfViewer;
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
      drawSocket.emit("SETUP");
    }, false)
  }
}


// Draw to the canvas
function renderCanvas(ctx) {
	
	if (drawing) {

		ctx.beginPath();
		
		if(mode == "pen"){

      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.globalAlpha = transparency;
		
			//ctx.strokeStyle = <line color>;
      //ctx.lineWidth = <line width>;
      
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

drawSocket.on('MOUSEDOWN', (data) => {
  let [x, y]= pdfViewer._pages[data.pageNum].viewport.convertToViewportPoint(data.lastPos.x, data.lastPos.y);
  lastPos = {x: x, y: y};
  //lastPos = data.lastPos;
  mode = data.mode;
  drawing = true;
})

drawSocket.on('MOUSEUP', (data) => {
  drawing = false;
})

drawSocket.on('MOUSEMOVE', (data) => {
  let [x, y] = pdfViewer._pages[data.pageNum].viewport.convertToViewportPoint(data.mousePos.x, data.mousePos.y);
  mousePos = {x: x, y: y};
  //mousePos = data.mousePos;
  let pageNum = data.pageNum;
  
  renderCanvas(ctx[pageNum - 1]);
})

var selColor = document.getElementById("selColor");
color = selColor.value;

var selWidth = document.getElementById("selWidth");
color = selWidth.value;

var selTransparency = document.getElementById("selTransparency");
transparency = selTransparency.value;

selColor.onchange = function(e) {
  color = selcolor.value;
}

selWidth.onchange = function(e) {
  width = selWidth.value;
}

selTransparency.onchange = function(e) {
  transparency = selTransparency.value;
}

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