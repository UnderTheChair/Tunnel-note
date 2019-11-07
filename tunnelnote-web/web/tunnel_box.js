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

      self.getPosition();
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
  }

  deactivate() {
    this.on = false;
    this.DOM.style.border = '';
    this.DOM.onmousedown = null;
    this.DOM.onscroll = null;
  }

  getPosition() {
    let pdfViewer = window.PDFViewerApplication.pdfViewer;
    let currentPage = pdfViewer._location.pageNumber;
    let clientX, clientY;
    
    clientX = this.left;
    clientY = this.top + this.height;

    let [pageX, pageY] = pdfViewer._pages[currentPage].viewport.convertToPdfPoint(clientX, clientY)
    console.log(pageX, pageY);
  }
}

const tunnel = new TunnelBox();

let toggle = function() {
  if (tunnel.on) tunnel.deactivate();
  else tunnel.activate();
}


document.querySelector("#tunnelMode").addEventListener('click', toggle);

export { TunnelBox, };