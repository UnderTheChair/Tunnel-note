class TunnelBox {
    constructor() {

        this.DOM = document.getElementById('tunnel');
        this.on = false;
        this.color = "#9400D3";
        this.lineWidth = 2;
        this.width = 100;
        this.height = 100;

    }
    _dragElement(elmnt) {
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
            this.top = (elmnt.offsetTop - pos2);
            this.left = (elmnt.offsetLeft - pos1);
            elmnt.style.top = this.top + "px";
            elmnt.style.left = this.left + "px";
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
    }
}

const tunnel = new TunnelBox();


let toggle = function() {
        if (tunnel.on) tunnel.deactivate();
        else tunnel.activate();

}

document.querySelector("#tunnelMode").addEventListener('click', toggle);

export { TunnelBox, };