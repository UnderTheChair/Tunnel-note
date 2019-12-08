import { TunnelBox } from './tunnel_box.js';
import { DrawService } from './drawing.js';
import { drawSocket } from './socket.io.js';

let isSetup = false;
var scale;
var scaleTimestamp = 0;
const tunnelBox_app = new TunnelBox();

window.customSetup = () => {
  if (isSetup == true) return false;
  console.log('Initializing canvas');
  isSetup = true;
  let canvases = document.getElementsByClassName('penCanvas');
  let viewerPage = document.querySelector("#viewer > div:nth-child(1)");

  let height = viewerPage.style.height.split('px')[0];
  let width = viewerPage.style.width.split('px')[0];
  console.log(height, width)
  let drawService = new DrawService(canvases, height, width);

  initDraw(drawService);

  window.drawService = drawService;
  window.drawService.loadCanvas();


  var penContainer = document.getElementById('penContainer');

  var hammer = new Hammer(penContainer, {
    touchAction: 'pan-x pan-y'
  });

  hammer.get('pinch').set({ enable: true });

  let curScale = window.PDFViewerApplication.pdfViewer._currentScale;
  let lastScale = curScale;

  hammer.on('pinchstart pinchmove pinchend', (e) => {
    if (drawService.mode === 'hand') {
      switch (e.type) {
        case 'pinchstart':
          curScale = lastScale;
          break;
        case 'pinchmove':
          lastScale = curScale * e.scale;
          window.PDFViewerApplication.pdfViewer._setScale(lastScale)
          break;
        case 'pinchend':
          curScale = lastScale;
          break;
      }
    }
  });
<<<<<<< HEAD
  window.customScaleCallback = () => {
    drawService.updateCanvas();
  };

  window.drawService.loadCanvas();
=======


>>>>>>> 179eba437990fffab31375b3da6a7baf4fef453f

  return true;
}

function initDraw(drawService) {
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

  let canvases = drawService.canvases;
  let cvsLen = canvases.length

  for (let i = 0; i < cvsLen; i++) {
    canvases[i].addEventListener("pagerendered", (event) => {
      drawService.pageRendered(i);
    })
    canvases[i].addEventListener("reset", (event) => {
      drawService.reset(i);
    })
  }
}

let tunnelToggle = function () {
  var windowWidth = $(window).width();
  if (windowWidth < 900) {     //mobile
    console.log("mobile is not support tunnel box");
    return;
  }
  if (tunnelBox_app.on) tunnelBox_app.deactivate();
  else tunnelBox_app.activate();
}
document.querySelector("#tunnelMode").addEventListener('click', tunnelToggle);

drawSocket.on('SETUP', () => {
  window.dispatchEvent(new Event('click'));
})

// Upload previous stored fileURL when user click pdf-card in Front
$(document).ready(function () {
  let fileURL = localStorage.getItem('fileURL')
  let pdfName = localStorage.getItem('pdfName')

  // USING DEVELOPMENT
  if (pdfName === null) {
    localStorage.setItem('pdfName', 'pdf')
  }

  if (fileURL)
    PDFViewerApplicationOptions.set('defaultUrl', fileURL);

});

document.getElementById('drawSaveMode').addEventListener('click', (e) => {
  window.drawService.saveCanvas();
});

export {
  tunnelBox_app
}


