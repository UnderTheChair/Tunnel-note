import { tunnelBoxSocket } from './socket.io.js' 

class TunnelBox {
  constructor() {
    this.DOM = document.getElementById('tunnel');
    this.container = document.getElementById('tunnelContainer');
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
    let self = this
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elmnt.onmousedown = dragMouseDown;
    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }
    function elementDrag(e) {
      let position;

      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      self.top = (elmnt.offsetTop - pos2);
      self.left = (elmnt.offsetLeft - pos1);
      elmnt.style.top = self.top + "px";
      elmnt.style.left = self.left + "px";

      position = self.getPosition();

      tunnelBoxSocket.emit('BOX_MOVE', position);
    }
    function closeDragElement() {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
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

  deactivate() {
    this.on = false;
    this.DOM.style.border = '';
    this.DOM.onmousedown = null;
    this.DOM.onscroll = null;

    tunnelBoxSocket.emit('BOX_CLEAR');
  }

  getPosition() {
    let pdfViewer = window.PDFViewerApplication.pdfViewer;
    let clientX, clientY;
    let currentPage = pdfViewer._location.pageNumber;
    let x, y, p1, p2;

    clientX = this.left - document.querySelector("#viewer > div:nth-child(1)").offsetLeft;
    clientY = this.top;

    // pt1 has [x, y] converted to PDF point
    [x, y]= pdfViewer._pages[currentPage].viewport.convertToPdfPoint(clientX, clientY);
    p1 = {x : x, y : y};
    
    [x, y] = pdfViewer._pages[currentPage].viewport.convertToPdfPoint(clientX + this.width, clientY - this.height);
    p2 = {x : x, y : y};

    return {
      pagePoint : [p1, p2],
      currentPage : currentPage,
    }
  }

  setPosition(position) {
    let {pagePoint, currentPage} = position;
    let pdfViewer = window.PDFViewerApplication.pdfViewer;
    let x, y, p1, p2;
    
    [x, y] = pdfViewer._pages[currentPage].viewport.convertToViewportPoint(pagePoint[0].x, pagePoint[0].y);
    p1 = {x : x, y : y}; 
    
    [x, y] = pdfViewer._pages[currentPage].viewport.convertToViewportPoint(pagePoint[1].x, pagePoint[1].y);
    p2 = {x : x, y : y};

    this.left = p1.x + document.querySelector("#viewer > div:nth-child(1)").offsetLeft;
    this.top = p1.y;
    
    this.DOM.style.left = this.left + "px";
    this.DOM.style.top = this.top + "px";

    this._setHeight(p1.y - p2.y);
    this._setWidth(p2.x - p1.x);
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
  if (tunnel.on) tunnel.deactivate();
  else tunnel.activate();
}


document.querySelector("#tunnelMode").addEventListener('click', toggle);

tunnelBoxSocket.on('BOX_INIT', (position) => {
  if (tunnel.on == true) return;
  tunnel.setPosition(position);
  tunnel.activate();
})

tunnelBoxSocket.on('BOX_MOVE', (position) => {
  if (tunnel.on == false ) return;
  tunnel.setPosition(position);
})

tunnelBoxSocket.on('BOX_CLEAR', (position) => {
  if (tunnel.on == false) return;
  tunnel.deactivate();
})

tunnelBoxSocket.on('BOX_DOWN', (position) => {
  if (tunnel.on = false) return;
})

tunnelBoxSocket.on('DISCONNECT', () => {
  tunnel.deactivate();
})

export { TunnelBox, };