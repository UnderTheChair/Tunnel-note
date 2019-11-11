import {socket} from "./socket.io.js";

// Set up the canvas
let canvas;
let ctx;
let mode;

// Set up mouse events for drawing
let drawing = false;
let mousePos = { x:0, y:0 };
let lastPos = mousePos;

let mousePenEvent = {
	mousedown(e){
		lastPos = getMousePos(canvas,e);
		drawing = true;

		socket.emit("MOUSEDOWN",{
			lastPos:lastPos,
			mode : mode,
		})
	},
	mouseup(e){
		drawing = false;

		socket.emit('MOUSEUP')
	},
	mousemove(e){
		mousePos = getMousePos(canvas,e)

		socket.emit('MOUSEMOVE',{
			mousePos:mousePos,
		})
		
		renderCanvas(ctx);
	}
}

class DrawService{
    constructor(canvasDom){
        canvas = canvasDom
        ctx = canvasDom.getContext('2d');
    }
    
    enableMouseEventListener(){
        canvas.addEventListener("mousedown", mousePenEvent.mousedown, false);

        canvas.addEventListener("mouseup", mousePenEvent.mouseup, false);

        canvas.addEventListener("mousemove", mousePenEvent.mousemove, false);
	}
	
	registerDrawToolButton(btn,tool){
		btn.addEventListener("click",(e)=>{
			mode = tool;
		},false)
	}
}


// Draw to the canvas
function renderCanvas(ctx) {
	
	if (drawing) {

		ctx.beginPath();
		
		if(mode == "pen"){
			var selcolor = document.getElementById("selcolor");
			selcolor.onchange = function(e) {
				ctx.strokeStyle = selcolor.value;
			}
			var selwidth = document.getElementById("selwidth");
			selwidth.onchange = function(e) {
				ctx.lineWidth = selwidth.value;
			}
			var seltransparency = document.getElementById("seltransparency");
			seltransparency.onchange = function(e) {
				ctx.globalAlpha = seltransparency.value;
			}
			//ctx.strokeStyle = <line color>;
			//ctx.lineWidth = <line width>;
			ctx.globalCompositeOperation="source-over";
			ctx.moveTo(lastPos.x, lastPos.y);
			ctx.lineTo(mousePos.x, mousePos.y);
			ctx.stroke();
		}
		else if(mode == "eraser"){
			ctx.globalCompositeOperation = "destination-out";  
			ctx.arc(lastPos.x,lastPos.y,20,0,Math.PI*2,false);
			ctx.fill();
		}

		lastPos = mousePos;
	}
}

// Get the position of the mouse relative to the canvas
function getMousePos(canvasDom, mouseEvent) {
	
	let rect = canvasDom.getBoundingClientRect();
	
	return {
		x: mouseEvent.clientX - rect.left,
		y: mouseEvent.clientY - rect.top
	};
}

socket.on('MOUSEDOWN',(data)=>{
	lastPos = data.lastPos;
	mode = data.mode;
	drawing = true;
})

socket.on('MOUSEUP',(data)=>{
	drawing = false;
})

socket.on('MOUSEMOVE',(data)=>{
	mousePos = data.mousePos;
	renderCanvas(ctx);
})
// TOOD : Mobile code on below

// Set up touch events for mobile, etc
/*
canvas.addEventListener("touchstart", function (e) {
	mousePos = getTouchPos(canvas, e);
	let touch = e.touches[0];
	let mouseEvent = new MouseEvent("mousedown", {
		clientX: touch.clientX,
		clientY: touch.clientY
	});
	canvas.dispatchEvent(mouseEvent);
}, false);
canvas.addEventListener("touchend", function (e) {
	let mouseEvent = new MouseEvent("mouseup", {});
	canvas.dispatchEvent(mouseEvent);
}, false);
canvas.addEventListener("touchmove", function (e) {
	let touch = e.touches[0];
	let mouseEvent = new MouseEvent("mousemove", {
		clientX: touch.clientX,
		clientY: touch.clientY
	});
	canvas.dispatchEvent(mouseEvent);
}, false);


// Get the position of a touch relative to the canvas
function getTouchPos(canvasDom, touchEvent) {
	let rect = canvasDom.getBoundingClientRect();
	return {
		x: touchEvent.touches[0].clientX - rect.left,
		y: touchEvent.touches[0].clientY - rect.top
	};
}
*/

export {
    DrawService
}