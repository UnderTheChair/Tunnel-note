import { TunnelBox } from './tunnel_box.js';
import { DrawService } from './drawing.js';
import { drawSocket } from './socket.io.js';
import { tunnelBoxSocket } from './socket.io.js';

let isSetup = false;
var scale;
var scaleTimestamp = 0;

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
  drawService.enableTouchEventListener();

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
  var container = document.getElementById('penContainer');
  var viewer = document.getElementById('viewerContainer');
  var hammer = new Hammer(container, {
    touchAction: 'pan-x pan-y'
  });

  hammer.get('pinch').set({ enable: true });
  hammer.get('pan').set({
    direction: Hammer.DIRECTION_ALL
  });

  var curScale = window.PDFViewerApplication.pdfViewer._location.scale;
  // hammer.on('pinch pinchend pan', (e)=> {
  hammer.on('pinch pinchend', (e)=> {
    if(window.drawService.mode === 'hand') {
      if(e.type == 'pinch') {
        if(performance.now() - scaleTimestamp > 80) {
          scaleTimestamp = performance.now();
          scale = parseInt(Math.max(50, Math.min(curScale * (e.scale), 400)));
          window.PDFViewerApplication.pdfViewer._setScale(scale/100)
        }
      } else if(e.type == 'pinchend') {
        curScale = scale;
        window.PDFViewerApplication.pdfViewer._setScale(curScale/100);
        drawService.updateCanvas();
      }
      // else if(e.type == 'pan') {
      //   viewer.scrollTo(
      //     viewer.scrollLeft - e.deltaX * 0.1,
      //     viewer.scrollTop - e.deltaY * 0.1
      //   );
      //   console.log(e);
      // }
    }
  });
  window.customScaleCallback = () => {
    drawService.updateCanvas();
  };

  return true;
}

drawSocket.on('SETUP',() => {
  window.dispatchEvent(new Event('click'));
})
