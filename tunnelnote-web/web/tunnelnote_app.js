import { TunnelBox } from './tunnel_box.js';
import { DrawService } from './drawing.js';
import { drawSocket } from "./socket.io.js";

let isSetup = false;
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
  console.log('initializing canvas');
  let canvases = document.getElementsByClassName('penCanvas');
  let tunnelBox = new TunnelBox();
  let drawService = new DrawService(canvases);

  isSetup = true;
  drawService.enableMouseEventListener();
  drawService.enableTouchEventListener();

  let penBtn = document.getElementById('penMode');
  let eraserBtn = document.getElementById('eraserMode');
  let secondaryPenBtn = document.getElementById('secondaryPenMode');
  let secondaryEraserBtn = document.getElementById('secondaryEraserMode');

  drawService.registerDrawToolButton(penBtn, 'pen');
  drawService.registerDrawToolButton(eraserBtn, 'eraser');
  drawService.registerDrawToolButton(secondaryPenBtn, 'pen');
  drawService.registerDrawToolButton(secondaryEraserBtn, 'eraser');

  return true;
}

drawSocket.on('SETUP',() => {
  window.dispatchEvent(new Event('click'));
})