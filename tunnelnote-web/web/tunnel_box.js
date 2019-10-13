
let tunnel = document.getElementById('tunnelCanvas');
let viewer = document.getElementById('viewerContainer');
let context = tunnel.getContext('2d');
let rectSize = { width: 400, height: 200 };
let rectPos = { x:0, y:0 };


class TunnelBox{
    constructor() {
        this.mode = false;
        context.strokeStyle = "violet"; 
        context.lineWidth = "3"; 
    }
    getMode(){
        return this.mode;
    }
    request(){
        this.mode = true;
        draw();
        tunnel.addEventListener("mousedown", handleMouseDown);
        tunnel.addEventListener("mouseup", handleMouseUp);
        
    }
    terminate(){
        this.mode = false;
        context.clearRect(0, 0, tunnel.width, tunnel.height);
        context.beginPath();
        tunnel.removeEventListener("mousedown", handleMouseDown);
        tunnel.removeEventListener("mouseup", handleMouseUp);
    }
    getRectInfo(){
        return {
            x: rectPos.x,
            y: rectPos.y,
            width: rectSize.width,
            height: rectSize.height
        };
    }
    setRectInfo(x, y, width, height){
        rectPos.x = x;
        rectPos.y = y;
        rectSize.width = width;
        rectSize.height = height;
    }
}
let mousePos = { x:0, y:0 };
let lastPos = mousePos;
let isDrag = false;

function draw(){
    context.clearRect(0, 0, tunnel.width, tunnel.height);
    context.beginPath();
    context.rect(rectPos.x, rectPos.y, 150, 100);
    context.stroke();
}

function handleMouseDown(mouseEvent) {
    mousePos = getMousePos(tunnel, mouseEvent);
    lastPos = mousePos;
    if(isInRect(mousePos)){
        tunnel.style.cursor = "pointer";
        isDrag = true;
        tunnel.addEventListener("mousemove", handleMouseMove);
    }
}
function handleMouseUp(mouseEvent) {
    isDrag = false;
    tunnel.style.cursor = 'default';
    draw();
}

function handleMouseMove(mouseEvent) {
    if(isDrag){
        mousePos = getMousePos(tunnel, mouseEvent);
        rectPos.x += mousePos.x - lastPos.x;
        rectPos.y += mousePos.y - lastPos.y;
        draw();
        lastPos = mousePos;
    }
}

function getMousePos(canvasDom, mouseEvent) {
    var rect = canvasDom.getBoundingClientRect();
    return {
        x: mouseEvent.clientX - rect.left,
        y: mouseEvent.clientY - rect.top
    };
}

function isInRect(pos){
    return ((pos.x >= rectPos.x && pos.x <= rectPos.x+rectSize.width)
        && (pos.y >= rectPos.y && pos.y <= rectPos.y+rectSize.height) );
}

export{
    TunnelBox,
};