import { tunnelBoxSocket } from './socket.io.js';
import { screenControl } from './screen_control.js';
import { tunnelBox_app } from './tunnelnote_app.js';

var socketTimestamp = performance.now();
var scaleChanging = false;

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
    // width = height * screenRatio
    this.resolution = 2;
    this.width = 300;
    this.height = 150;
    this.left = 0;
    this.top = 0;
    this.mobileDrag = true;
    this.isMobile = true;
    this.isHandMode = true;
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
        console.log("is not hand mode");
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
      container.addEventListener("mouseup", closeDragElement);
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

      let position = self.getPosition();
      if(socketReady()) tunnelBoxSocket.emit('BOX_RESIZE', position);
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

      let position = self.getPosition();
      if(socketReady()) tunnelBoxSocket.emit('BOX_MOVE', position);
    }
    function closeDragElement() {
      // stop moving when mouse button is released:
      container.style.cursor = "grab";
      container.removeEventListener("mouseup", closeDragElement);
      container.removeEventListener("mousedown", dragMouseDown);
      container.removeEventListener("mousedown", resizeMouseDown);
      container.removeEventListener("mousemove", elementDrag);
      container.removeEventListener("mousemove", elementResize);
      container.addEventListener("mousemove", currentMouseMove);

      tunnelBoxSocket.emit('PC_MOVE_END', null);
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
    this.left = document.querySelector(`#viewer > div:nth-child(${1})`).offsetLeft;
    this.DOM.style.left = this.left + 'px';
    this.DOM.style.height = this.height + 'px';
    this.DOM.style.width = this.width + 'px';
    this.DOM.style.border = '2px solid #abc';
    if(!this.isInit){
      this._dragElement(this.DOM);
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

  rcvActivate() {
    this.on = true;
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

  rcvDeactivate() {
    this.on = false;
    this.deactivate();
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

  //mobile
  setMobilePosition(position) {
    let {pagePoint, currentPage, width, currentScale, boxHeight, boxWidth} = position;
    let pdfViewer = window.PDFViewerApplication.pdfViewer;
    let currentPageElment = document.querySelector(`#viewer > div:nth-child(${currentPage})`);
    let x, y, p1, p2;
    let newScale;
    
    [x, y] = pdfViewer._pages[0].viewport.convertToViewportPoint(pagePoint[0].x, pagePoint[0].y);
    p1 = {x : x, y : y}; 
    
    [x, y] = pdfViewer._pages[0].viewport.convertToViewportPoint(pagePoint[1].x, pagePoint[1].y);
    p2 = {x : x, y : y};

    this.left = p1.x + currentPageElment.offsetLeft;
    this.top = p1.y;
    
    screenControl.setScrollTop(currentPageElment.offsetTop + this.top);
    screenControl.setScrollLeft(currentPageElment.offsetLeft + this.left);
    screenControl.setOffsetWidth(boxWidth);
    screenControl.setOffsetHeight(boxHeight);

    newScale = (document.body.clientWidth / (width / currentScale)) * (width / boxWidth);
    scaleChanging = true;
    pdfViewer._setScale(newScale);
    scaleChanging = false;
  }

  //mobile
  setSize(width, height){
    this.width = width;
    this.height = height;
  }
  setPos(){
    this.top = document.querySelector('#viewerContainer').scrollTop;
    this.left = document.querySelector('#viewerContainer').scrollLeft;
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
    
    tunnel.DOM.style.top = this.top + 'px';
    tunnel.DOM.style.left = this.left + 'px';
    //this.width = currentScale * this.width;
  }
  //pc by mobile control
  setBoxSize(mobileWidth, mobileHeight, mobileScale) {
    this.width = mobileWidth / mobileScale;
    this.DOM.style.width = this.width + 'px';
    this.height = mobileHeight / mobileScale;
    this.DOM.style.height = this.height + 'px';
    this.resolution = this.width / this.height;
  }
}

let tunnel;

//pc -> mobile
tunnelBoxSocket.on('BOX_INIT', (position) => {
  tunnel = tunnelBox_app;
  if (tunnel.on == true) return;

  //detect mobile window control
  $('#viewerContainer').scroll(mobileScrollCallback);
  window.customScaleCallback = () => {
    // var position = tunnel.getPosition();
    // if(!scaleChanging && socketReady()) tunnelBoxSocket.emit('MOBILE_RESIZE', position);
    // window.drawService.updateCanvas()
  };

  let toolbar_height = document.getElementById('toolbarContainer').offsetHeight;
  let mobile_width = $( window ).width();
  let mobile_height = $( window ).height() - toolbar_height;

  tunnelBoxSocket.emit('BOX_SIZE_INIT', { 
    width: mobile_width, 
    height: mobile_height
  });
  tunnel.setSize(mobile_width, mobile_height);
  tunnel.setMobilePosition(position);
  tunnel.rcvActivate();
});

tunnelBoxSocket.on('BOX_MOVE', (position) => {
  // Temporary remove for continue operating when page referch at remote device
  if (tunnel.on == false ) return;
  tunnel.mobileDrag = false;
  tunnel.setMobilePosition(position);
});

tunnelBoxSocket.on('BOX_RESIZE', (position) => {
  tunnel.setMobilePosition(position);
  tunnel.mobileDrag = false;
});

tunnelBoxSocket.on('PC_MOVE_END', () => {
  tunnel.mobileDrag = true;
});

tunnelBoxSocket.on('BOX_CLEAR', (position) => {
  if (tunnel.on == false) return;
  tunnel.rcvDeactivate();
});

tunnelBoxSocket.on('BOX_DOWN', (position) => {
  if (tunnel.on = false) return;
});

tunnelBoxSocket.on('DISCONNECT', () => {
  if (tunnel === undefined) return;
  tunnel.rcvDeactivate();
});

//mobile -> pc
tunnelBoxSocket.on('BOX_SIZE_INIT', (sizeData) => {
  tunnel = tunnelBox_app;
  tunnel.setBoxSize(sizeData.width, sizeData.height, 1.5);
  var position = tunnel.getPosition();
  tunnelBoxSocket.emit('BOX_MOVE', position);
  tunnelBoxSocket.emit('PC_MOVE_END', null);
});

tunnelBoxSocket.on('MOBILE_MOVE', (position) => {
  if(tunnel === undefined) return;
  tunnel.setBoxPosition(position);
});

tunnelBoxSocket.on('MOBILE_RESIZE', (position) => {
  if(tunnel === undefined) return;
  tunnel.setBoxPosition(position);
  tunnel.setBoxSize(position.boxWidth, position.boxHeight, position.currentScale);
});

//in mobile call
let mobileScrollCallback = () => {
  // callback
  if(tunnel.mobileDrag){
    tunnel.setPos();
    var position = tunnel.getPosition();
    if(socketReady()) tunnelBoxSocket.emit('MOBILE_MOVE', position);
  }
};

export { TunnelBox, };