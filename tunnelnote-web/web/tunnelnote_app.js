import { TunnelBox } from './tunnel_box.js';
import { DrawService } from './drawing.js';

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
  console.log('initializing canvas');
  let canvases = document.getElementsByClassName('penCanvas');
  let tunnelBox = new TunnelBox();
  let drawService = new DrawService(canvases);
  drawService.enableMouseEventListener();

  let penBtn = document.getElementById('penMode');
  let eraserBtn = document.getElementById('eraserMode');

  drawService.registerDrawToolButton(penBtn,"pen");
  drawService.registerDrawToolButton(eraserBtn,"eraser");

}
