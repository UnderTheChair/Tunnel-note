import { tunnelBoxSocket } from './socket.io.js';
import { screenControl } from './screen_control.js';
import { tunnelBox_app } from './tunnelnote_app.js';

let tunnel;

var socketTimestamp = performance.now();
var scaleChanging = false;

let isPCScroll = true;
function socketReady() {
  if(performance.now() - socketTimestamp > 0.05) {
    socketTimestamp = performance.now();
    return true;
  }
  return false;
}

class TunnelBox {
  constructor() {
    this.DOM = document.getElementById('tunnel');
    this.resizeDOM = document.getElementById('resizer');
    this.on = false;
    this.isInit = false;
    // width = height * resolution
    this.resolution = 2;
    this.width = 300;
    this.height = 150;
    this.left = 0;
    this.top = 0;

    this.mobileWidth = 300;
    this.mobileHeight = 150;
    this.initScaleValue = 1.5;

    this.isHandMode = true;
    this.isMobileDrag = true;
    this.isMobile = true;
  }
  _dragElement(elmnt) {
    let container = document.getElementById('penContainer');
    let resizer = document.getElementById('resizer');
    let self = this;
    var rect;
    var currentPos = { x:0, y:0 };
    var changePos = { x:0, y:0 };
    var lastPos = { x:0, y:0 };

    resizer.addEventListener('mousedown', resizeMouseDown);
    container.addEventListener("mousemove", currentMouseMove);

    function currentMouseMove(e){
      if(!self.isHandMode){
        closeDragElement();
        container.style.cursor = "default";
        return;
      }
      currentPos.x = e.clientX;
      currentPos.y = e.clientY;
      rect = elmnt.getBoundingClientRect();
      if(isRectLine(currentPos.x, currentPos.y)){
        container.style.cursor = "grab";
        container.addEventListener("mousedown", dragMouseDown);
      }else{
        container.style.cursor = "default";
        container.removeEventListener("mousedown", dragMouseDown);
        container.removeEventListener("mousedown", resizeMouseDown);
      }
    }
    function resizeMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      e.stopPropagation();
      lastPos.x = e.clientX;
      lastPos.y = e.clientY;
      container.removeEventListener("mousemove", currentMouseMove);
      container.addEventListener("mousemove", elementResize);
      container.addEventListener("mouseup", closeResizeElement);
    }
    function dragMouseDown(e) {
      container.style.cursor = "grabbing";
      e = e || window.event;
      e.preventDefault();
      lastPos.x = e.clientX;
      lastPos.y = e.clientY;
      container.removeEventListener("mousemove", currentMouseMove);
      container.addEventListener("mousemove", elementDrag);
      container.addEventListener("mouseup", closeDragElement);
    }
    function elementResize(e) {
      container.style.cursor = "nwse-resize";
      e = e || window.event;
      e.preventDefault();
      currentPos.y = e.clientY;
      changePos.y = currentPos.y - lastPos.y;

      self.height = self.height + changePos.y;
      self.width = self.height * self.resolution;
      elmnt.style.height = self.height + "px";
      elmnt.style.width = self.width + "px";
      
      lastPos.y = currentPos.y;
    }
    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      currentPos.x = e.clientX;
      currentPos.y = e.clientY;
      // calculate the new cursor position:
      changePos.x = lastPos.x - currentPos.x;
      changePos.y = lastPos.y - currentPos.y;
      // set the element's new position:
      self.top = (elmnt.offsetTop - changePos.y);
      self.left = (elmnt.offsetLeft - changePos.x);
      elmnt.style.top = self.top + "px";
      elmnt.style.left = self.left + "px";
      lastPos.x = currentPos.x;
      lastPos.y = currentPos.y;
    }
    function closeDragElement() {
      // stop moving when mouse button is released:
      container.style.cursor = "grab";
      container.removeEventListener("mouseup", closeDragElement);
      container.removeEventListener("mousedown", dragMouseDown);
      container.removeEventListener("mousemove", elementDrag);
      container.addEventListener("mousemove", currentMouseMove);

      let position = self.getPosition();
      if(socketReady()) tunnelBoxSocket.emit('BOX_MOVE', position);
    }
    function closeResizeElement() {
      container.style.cursor = "default";
      container.removeEventListener("mouseup", closeResizeElement);
      container.removeEventListener("mousedown", resizeMouseDown);
      container.removeEventListener("mousemove", elementResize);
      container.addEventListener("mousemove", currentMouseMove);

      let position = self.getPosition();
      if(socketReady()) tunnelBoxSocket.emit('BOX_RESIZE', position);
    }
    function isRectLine(x, y){
      if(rect.left-5 < x && x < rect.left+5){
        if(rect.top-5 < y && y < rect.bottom+5){
          return true;
        }
      }
      if(rect.right-5 < x && x < rect.right+5){
        if(rect.top-5 < y && y < rect.bottom-10){
          return true;
        }
      }
      if(rect.top-5 < y && y < rect.top+5){
        if(rect.left-5 < x && x < rect.right+5){
          return true;
        }
      }
      if(rect.bottom-5 < y && y < rect.bottom+5){
        if(rect.left-5 < x && x < rect.right-10){
          return true;
        }
      }
      return false;
    }
  }

  activate() {
    this.isMobile = false;
    this.on = true;
    this.DOM.style.top = this.top + 'px';
    this.DOM.style.left = this.left + 'px';
    this.DOM.style.height = this.height + 'px';
    this.DOM.style.width = this.width + 'px';
    this.DOM.style.border = '2px solid #abc';
    if(!this.isInit){
      this.left = document.querySelector(`#viewer > div:nth-child(${1})`).offsetLeft;
      this._dragElement(this.DOM);
      $('#viewerContainer').on('scrolldelta', maintainBoxPositionSticky);
      this.isInit = true;
    }
    
    this.resizeDOM.style.borderRadius = '50%';
    this.resizeDOM.style.border = '2px solid #abc';
    this.resizeDOM.style.bottom = '-6px';
    this.resizeDOM.style.right = '-6px';
    this.resizeDOM.style.height = '12px';
    this.resizeDOM.style.width = '12px';

    let position = this.getPosition();
    tunnelBoxSocket.emit('BOX_INIT', position);
    
  }

  deactivate() {
    this.on = false;
    this.DOM.style.border = '';
    this.DOM.style.height = '0px';
    this.DOM.style.width = '0px';
    this.DOM.onmousedown = null;
    this.DOM.onscroll = null;

    this.resizeDOM.style.borderRadius = '0%';
    this.resizeDOM.style.border = '';
    this.resizeDOM.style.height = '0px';
    this.resizeDOM.style.width = '0px';
    
    tunnelBoxSocket.emit('BOX_CLEAR');
  }
  getPosition() {
    let pdfViewer = window.PDFViewerApplication.pdfViewer;
    let clientX, clientY;
    let currentPage = pdfViewer._location.pageNumber;
    let x, y, p1, p2;
    
    clientX = this.left - document.querySelector(`#viewer > div:nth-child(${currentPage})`).offsetLeft;
    clientY = this.top;

    // pt1 has [x, y] converted to PDF point
    [x, y]= pdfViewer._pages[0].viewport.convertToPdfPoint(clientX, clientY);
    p1 = {x : x, y : y};

    [x, y] = pdfViewer._pages[0].viewport.convertToPdfPoint(clientX + this.width, clientY - this.height);
    p2 = {x : x, y : y};

    if(p1.y <= 0){
      currentPage = 1;
    }

    return {
      pagePoint : [p1, p2],
      currentPage : currentPage,
     // For setting size of screen corresponded with the tunnel box
      width: document.body.clientWidth,
      currentScale : pdfViewer.currentScale,
      boxHeight : this.height,
      boxWidth : this.width
    }
  }

  //pc by mobile control
  setBoxPosition(position){
    let {pagePoint, currentPage} = position;
    let pdfViewer = window.PDFViewerApplication.pdfViewer;
    let currentPageElment = document.querySelector(`#viewer > div:nth-child(${currentPage})`);
    let tmpX, tmpY;

    [tmpX, tmpY] = pdfViewer._pages[0].viewport.convertToViewportPoint(pagePoint[0].x, pagePoint[0].y);
    let p1 = { x: tmpX, y: tmpY };

    this.left = p1.x + currentPageElment.offsetLeft;
    this.top = p1.y;
    
    this.DOM.style.top = this.top + 'px';
    this.DOM.style.left = this.left + 'px';
    maintainBoxPositionSticky();
  }
  setBoxSizeInit(sizeData){
    this.mobileHeight = sizeData.height;
    this.mobileWidth = sizeData.width;
    this.resolution = this.mobileWidth/ this.mobileHeight;
    this.setBoxSize(this.initScaleValue);
  }
  setBoxSize(mobileScale) {
    let currentScale = window.PDFViewerApplication.pdfViewer.currentScale;
    this.height = (this.mobileHeight / mobileScale) * currentScale; 
    this.DOM.style.height = this.height + 'px';
    this.width = this.height * this.resolution;
    this.DOM.style.width = this.width + 'px';
  }
}

let toolbar_height = document.getElementById('toolbarContainer').offsetHeight;

//mobile -> pc
tunnelBoxSocket.on('BOX_SIZE_INIT', (sizeData) => {
  tunnel = tunnelBox_app;
  tunnel.setBoxSizeInit(sizeData);

  //set mobile position
  var pcPosition = tunnel.getPosition();
  tunnelBoxSocket.emit('BOX_RESIZE', pcPosition);
});

tunnelBoxSocket.on('MOBILE_MOVE', (position) => {
  if(tunnel === undefined) return;
  isPCScroll = false;
  tunnel.setBoxPosition(position);
});

tunnelBoxSocket.on('MOBILE_RESIZE', (position) => {
  if(tunnel === undefined) return;
  console.log(position);
  tunnel.setBoxSize(position.currentScale);
  tunnel.setBoxPosition(position);
});

tunnelBoxSocket.on('MOBILE_ROTATE', () => {
  if(tunnel === undefined) return;
  tunnel.deactivate();
  tunnel.activate();
});

//check box move by pc scroll
let isBoxMove = false;
let lastScrollTop = 0;
let PcWindowHeight = $(window).height();

// setInterval(function(){
//   if(isBoxMove){
//     let position = tunnel.getPosition();
//     if(socketReady()) tunnelBoxSocket.emit('BOX_MOVE', position);
//     isBoxMove = false;
//   }
// }, 250);

function maintainBoxPositionSticky(e) {
  let containerDOM = window.PDFViewerApplication.pdfViewer.container;
  switch(checkStuck()) {
    case 0:
      return;
    case 1: // TOP
      if(isPCScroll) {
        tunnel.top = containerDOM.scrollTop;
        tunnel.DOM.style.top = tunnel.top + 'px';
        if(socketReady()) tunnelBoxSocket.emit('BOX_MOVE', tunnel.getPosition());
      }
      else {
        containerDOM.scrollTop = tunnel.DOM.offsetTop;
        isPCScroll = true;
      }
      break;
    case 2: // LEFT
      if(isPCScroll) {
        tunnel.left = containerDOM.scrollLeft;
        tunnel.DOM.style.left = tunnel.left + 'px';
        if(socketReady()) tunnelBoxSocket.emit('BOX_MOVE', tunnel.getPosition());
      }
      else {
        containerDOM.scrollLeft = tunnel.DOM.offsetLeft; 
        isPCScroll = true;
      }
      break;
    case 3: // BOTTOM
      if(isPCScroll) {
        tunnel.top =  window.innerWidth + containerDOM.scrollLeft - tunnel.DOM.offsetWidth;
        tunnel.DOM.style.top = tunnel.top + 'px';
        if(socketReady()) tunnelBoxSocket.emit('BOX_MOVE', tunnel.getPosition());
      }
      else {
        containerDOM.scrollTop = tunnel.DOM.offsetTop + tunnel.DOM.offsetHeight + toolbar_height
          - window.innerHeight;
        isPCScroll = true;
      }
      break;
    case 4: // RIGHT
      if(isPCScroll) {
        tunnel.left = window.innerHeight + containerDOM.scrollTop
          - tunnel.DOM.offsetHeight;
        tunnel.DOM.style.left =  tunnel.left + 'px';
        if(socketReady()) tunnelBoxSocket.emit('BOX_MOVE', tunnel.getPosition());
      }
      else {
        containerDOM.scrollLeft = tunnel.DOM.offsetLeft + tunnel.DOM.offsetWidth 
          - window.innerWidth;
        isPCScroll = true;
      }
      break;
    case 5: // Tunnel bigger than window
      containerDOM.scrollTop = tunnel.DOM.offsetTop;
      containerDOM.scrollLeft = tunnel.DOM.offsetLeft; 
      break;
  }
}

let stickyTimestamp = 0;
function checkStuck() {
  if(performance.now() - stickyTimestamp < 0.01)
    return 0;
  stickyTimestamp = performance.now();
  let containerDOM = window.PDFViewerApplication.pdfViewer.container;

  if(tunnel.height > window.innerHeight || tunnel.width > window.innerWidth)
      return 5;
  if(tunnel.DOM.offsetTop - containerDOM.scrollTop < 0)
    return 1;
  if(tunnel.DOM.offsetLeft - containerDOM.scrollLeft < 0)
    return 2;
  if(tunnel.DOM.offsetTop + tunnel.DOM.offsetHeight
      + toolbar_height - window.innerHeight - containerDOM.scrollTop > 0)
    return 3;
  if(tunnel.DOM.offsetLeft + tunnel.DOM.offsetWidth
      - window.innerWidth - containerDOM.scrollLeft > 0)
    return 4;
  return 0;
}


export { TunnelBox, };