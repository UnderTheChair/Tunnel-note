
let canvas = document.getElementById('tunnelCanvas');
let context = canvas.getContext('2d');
let rectSize = { width: 400, height: 200 };
let rectPos = { x:0, y:0 };
class TunnelBox{
    constructor() {
        this.mode = false;
        context.strokeStyle = "violet"; 
        context.lineWidth = "10"; 
    }

    getMode(){
        return this.mode;
    }

    request(){
        this.mode = true;
        draw();
        canvas.addEventListener("mousedown", handleMouseDown);
        canvas.addEventListener("mouseup", handleMouseUp);
        
        socket.emit('SEND_MESSAGE',{
            x: rectPos.x,
            y: rectPos.y,
            width: rectSize.width,
            height: rectSize.height
        })

    }
    terminate(){
        this.mode = false;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mouseup", handleMouseUp);
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
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    context.rect(rectPos.x, rectPos.y, rectSize.width, rectSize.height);
    context.stroke();
}

function handleMouseDown(mouseEvent) {
    mousePos = getMousePos(canvas, mouseEvent);
    lastPos = mousePos;
    if(isInRect(mousePos)){
        canvas.style.cursor = 'pointer';
        isDrag = true;
        canvas.addEventListener("mousemove", handleMouseMove);
    }
}
function handleMouseUp(mouseEvent) {
    isDrag = false;
    canvas.style.cursor = 'default';
    draw();
}

function handleMouseMove(mouseEvent) {
    if(isDrag){
        mousePos = getMousePos(canvas, mouseEvent);
        rectPos.x += mousePos.x - lastPos.x;
        rectPos.y += mousePos.y - lastPos.y;
        draw();
        lastPos = mousePos;

        
        socket.emit('SEND_MESSAGE',{
            x: rectPos.x,
            y: rectPos.y,
            width: rectSize.width,
            height: rectSize.height
        })
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