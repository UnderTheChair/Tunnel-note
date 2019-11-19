import { tunnelBoxSocket } from './socket.io.js' 
import { screenControl } from './screen_control.js'

class TunnelBox {
  constructor() {
    this.DOM = document.getElementById('tunnel');
    this.on = false;
    this.color = "#9400D3";
    this.lineWidth = 2;
    this.width = 300;
    this.height = 150;
    this.stuck = false;
    this.left = 0;
    this.top = 0;
  }
  _dragElement(elmnt) {
    let container = document.getElementById('penContainer');
    let self = this;
    var rect;
    var currentPos = { x:0, y:0 };
    var changePos = { x:0, y:0 };
    var lastPos = { x:0, y:0 }

    container.addEventListener("mousemove", currentMouseMove);

    function currentMouseMove(e){
      currentPos.x = e.clientX;
      currentPos.y = e.clientY;
      rect = elmnt.getBoundingClientRect();
      if(isRectLine(currentPos.x, currentPos.y)){
        container.style.cursor = "grab";
        container.addEventListener("mousedown", dragMouseDown);
      }else{
        container.style.cursor = "default";
        container.removeEventListener("mousedown", dragMouseDown);
      }
    }
    function dragMouseDown(e) {
      container.style.cursor = "grabbing";
      e = e || window.event;
      e.preventDefault();
      lastPos.x = e.clientX;
      lastPos.y = e.clientY;
      container.addEventListener("mousemove", elementDrag);
      container.addEventListener("mouseup", closeDragElement);
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
      tunnelBoxSocket.emit('BOX_MOVE', position);
    }
    function closeDragElement() {
      // stop moving when mouse button is released:
      container.style.cursor = "grab";
      container.removeEventListener("mouseup", closeDragElement);
      container.removeEventListener("mousedown", dragMouseDown);
      container.removeEventListener("mousemove", elementDrag);
      container.addEventListener("mousemove", currentMouseMove);
    }
    function isRectLine(x, y){
      if(rect.left-5 < x && x < rect.left+5){
        if(rect.top-5 < y && y < rect.bottom+5){
          return true;
        }
      }
      if(rect.right-5 < x && x < rect.right+5){
        if(rect.top-5 < y && y < rect.bottom+5){
          return true;
        }
      }
      if(rect.top-5 < y && y < rect.top+5){
        if(rect.left-5 < x && x < rect.right+5){
          return true;
        }
      }
      if(rect.bottom-5 < y && y < rect.bottom+5){
        if(rect.left-5 < x && x < rect.right+5){
          return true;
        }
      }
      return false;
    }
  }

  activate() {
    this.on = true;
    this.DOM.style.height = this.height + 'px';
    this.DOM.style.width = this.width + 'px';
    this.DOM.style.border = '2px solid #abc';
    this._dragElement(this.DOM);

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

    tunnelBoxSocket.emit('BOX_CLEAR');
  }

  rcvDeactivate() {
    this.on = false;
  }

  getPosition() {
    let pdfViewer = window.PDFViewerApplication.pdfViewer;
    let clientX, clientY;
    let currentPage = pdfViewer._location.pageNumber;
    let x, y, p1, p2;

    clientX = this.left - document.querySelector(`#viewer > div:nth-child(${currentPage})`).offsetLeft;
    clientY = this.top;

    // pt1 has [x, y] converted to PDF point
    [x, y]= pdfViewer._pages[currentPage].viewport.convertToPdfPoint(clientX, clientY);
    p1 = {x : x, y : y};
    
    [x, y] = pdfViewer._pages[currentPage].viewport.convertToPdfPoint(clientX + this.width, clientY - this.height);
    p2 = {x : x, y : y};

    return {
      pagePoint : [p1, p2],
      currentPage : currentPage,
      // For setting size of screen corresponded with the tunnel box
      width: document.body.clientWidth,
      currentScale : pdfViewer.currentScale,
      boxHeight : this.height,
      boxWidth : this.width,
    }
  }

  setPosition(position) {
    let {pagePoint, currentPage, width, currentScale, boxHeight, boxWidth} = position;
    let pdfViewer = window.PDFViewerApplication.pdfViewer;
    let currentPageElment = document.querySelector(`#viewer > div:nth-child(${currentPage})`);
    let x, y, p1, p2;
    let newScale;
    
    
    [x, y] = pdfViewer._pages[currentPage].viewport.convertToViewportPoint(pagePoint[0].x, pagePoint[0].y);
    p1 = {x : x, y : y}; 
    
    [x, y] = pdfViewer._pages[currentPage].viewport.convertToViewportPoint(pagePoint[1].x, pagePoint[1].y);
    p2 = {x : x, y : y};

    this.left = p1.x + currentPageElment.offsetLeft;
    this.top = p1.y;
    
    screenControl.setScrollTop(currentPageElment.offsetTop + this.top);
    screenControl.setScrollLeft(currentPageElment.offsetLeft + this.left);

    newScale = (document.body.clientWidth / (width / currentScale)) * (width / boxWidth);
    pdfViewer.currentScaleValue = newScale;
    
  }

  _setWidth(dist) {
    this.width = dist;
    this.DOM.style.width = dist;
  }

  _setHeight(dist) {
    this.height = dist;
    this.DOM.style.height = dist;
  }
}

const tunnel = new TunnelBox();

let toggle = function() {
  console.log("tunnel toggle");
  if (tunnel.on) tunnel.deactivate();
  else tunnel.activate();
}


document.querySelector("#tunnelMode").addEventListener('click', toggle);

tunnelBoxSocket.on('BOX_INIT', (position) => {
  if (tunnel.on == true) return;
  tunnel.setPosition(position);
  tunnel.rcvActivate();
})

tunnelBoxSocket.on('BOX_MOVE', (position) => {
  // Temporary remove for continue operating when page referch at remote device
  //if (tunnel.on == false ) return;
  tunnel.setPosition(position);
})

tunnelBoxSocket.on('BOX_CLEAR', (position) => {
  if (tunnel.on == false) return;
  tunnel.rcvDeactivate();
})

tunnelBoxSocket.on('BOX_DOWN', (position) => {
  if (tunnel.on = false) return;
})

tunnelBoxSocket.on('DISCONNECT', () => {
  tunnel.rcvDeactivate();
})

export { TunnelBox, };