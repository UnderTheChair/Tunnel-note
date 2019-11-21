import { TunnelBox } from './tunnel_box.js';
import { DrawService } from './drawing.js';
import { drawSocket } from "./socket.io.js";

let isSetup = false;
var scale;

window.addEventListener('wheel', onPdfLoad);
window.addEventListener('click', onPdfLoad);

function onPdfLoad(e) {
  if(window.PDFViewerApplication.pdfDocument) {
    setup();
    window.removeEventListener('wheel', onPdfLoad);
    window.removeEventListener('click', onPdfLoad);
  }
}

function setup() {
  if (isSetup == true) return false;
  console.log('Initializing canvas');
  let canvases = document.getElementsByClassName('penCanvas');
  let tunnelBox = new TunnelBox();
  let drawService = new DrawService(canvases);

  isSetup = true;
  drawService.enableMouseEventListener();
  // drawService.enableTouchEventListener();

  let penBtn = document.getElementById('penMode');
  let eraserBtn = document.getElementById('eraserMode');
  let handBtn = document.getElementById('handMode');
  let secondaryPenBtn = document.getElementById('secondaryPenMode');
  let secondaryEraserBtn = document.getElementById('secondaryEraserMode');
  let secondaryHandBtn = document.getElementById('secondaryHandMode');

  drawService.registerDrawToolButton(penBtn, 'pen');
  drawService.registerDrawToolButton(eraserBtn, 'eraser');
  drawService.registerDrawToolButton(handBtn, 'hand');
  drawService.registerDrawToolButton(secondaryPenBtn, 'pen');
  drawService.registerDrawToolButton(secondaryEraserBtn, 'eraser');
  drawService.registerDrawToolButton(secondaryHandBtn, 'hand');

  window.drawService = drawService;
  console.log(window.drawService);
  var container = document.getElementById('penContainer');
  var mc = new Hammer.Manager(container);
  
  var curScale = window.PDFViewerApplication.pdfViewer._location.scale;

  var pinch = new Hammer.Pinch();
  mc.add(pinch);
  mc.on('pinch pinchend', (e)=> {
    if(e.type == 'pinch') {
      scale = Math.max(.5, Math.min(curScale * (e.scale), 4));
    }
    if(e.type == 'pinchend') {
      curScale = scale;
      window.PDFViewerApplication.pdfViewer._setScale(curScale)
      drawService.updateCanvas();
    }
  });

  return true;
}

drawSocket.on('SETUP',() => {
  window.dispatchEvent(new Event('click'));
})
