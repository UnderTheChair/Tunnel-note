import { TunnelBox } from './tunnel_box.js';
import { DrawService } from './drawing.js';
import { drawSocket } from './socket.io.js';

let isSetup = false;
var scale;
var scaleTimestamp = 0;
const tunnelBox_app = new TunnelBox();

window.customSetup = ()=> {
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
  var container = document.getElementById('penContainer');
  var viewer = document.getElementById('viewerContainer');
  // var hammer = new Hammer(container, {
  //   touchAction: 'pan-x pan-y'
  // });

  // hammer.get('pinch').set({ enable: true });
  // hammer.get('pan').set({
  //   direction: Hammer.DIRECTION_ALL
  // });

  // var curScale = window.PDFViewerApplication.pdfViewer._location.scale;

  // // hammer.on('pinch pinchend pan', (e)=> {
  // hammer.on('pinch pinchend', (e)=> {
  //   if(window.drawService.mode === 'hand') {
  //     if(e.type == 'pinch') {
  //       if(performance.now() - scaleTimestamp > 80) {
  //         scaleTimestamp = performance.now();
  //         scale = parseInt(Math.max(50, Math.min(curScale * (e.scale), 400)));
  //         window.PDFViewerApplication.pdfViewer._setScale(scale / 100)
  //       }
  //     } else if(e.type == 'pinchend') {
  //       curScale = scale;
  //       window.PDFViewerApplication.pdfViewer._setScale(curScale / 100);
  //       drawService.updateCanvas();
  //     }
  //     // else if(e.type == 'pan') {
  //     //   viewer.scrollTo(
  //     //     viewer.scrollLeft - e.deltaX * 0.1,
  //     //     viewer.scrollTop - e.deltaY * 0.1
  //     //   );
  //     //   console.log(e);
  //     // }
  //   }
  // });
  window.customScaleCallback = () => {
    drawService.updateCanvas();
  };

  //drag TunnelBox only in handmode
  if(drawService.mode != 'hand'){

  }

  window.drawService.loadCanvas();

  return true;
}

function initDraw(drawService){
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
    canvases[i].addEventListener("pagerendered", (event)=>{
      drawService.pageRendered(i);
    })
    canvases[i].addEventListener("reset", (event) => {
      drawService.reset(i);
    })
  }
}

let tunnelToggle = function() {
  var windowWidth = $( window ).width();
  if(windowWidth < 900){     //mobile
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
  if(pdfName === null) {
    localStorage.setItem('pdfName', 'pdf')
  }

  if(fileURL)
    PDFViewerApplicationOptions.set('defaultUrl', fileURL);

});

document.getElementById('drawSaveMode').addEventListener('click', (e)=>{
  window.drawService.saveCanvas();
});

export{
  tunnelBox_app
}


