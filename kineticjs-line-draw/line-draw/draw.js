// Set up the canvas
let canvas = document.getElementById("sig-canvas");
let ctx = canvas.getContext('2d');

let mode = "pen";

// Set up mouse events for drawing
let drawing = false;
let mousePos = { x:0, y:0 };
let lastPos = mousePos;

// Set up the UI
let penBtn = document.getElementById("sig-penBtn");
let eraserBtn = document.getElementById("sig-eraserBtn");

penBtn.addEventListener("click", function(e) {
	mode = "pen";
}, false);

eraserBtn.addEventListener("click", function (e) {
	mode = "eraser";
}, false);


let mousePenEvent = {
	mousedown(e){
		lastPos = getMousePos(canvas,e);
		drawing = true;
	},
	mouseup(e){
		drawing = false;
	},
	mousemove(e){
		mousePos = getMousePos(canvas,e)
		renderCanvas();
	}
}

canvas.addEventListener("mousedown", mousePenEvent.mousedown, false);

canvas.addEventListener("mouseup", mousePenEvent.mouseup, false);

canvas.addEventListener("mousemove", mousePenEvent.mousemove, false);

// Draw to the canvas
function renderCanvas() {
	
	if (drawing) {

		ctx.beginPath();
		
		if(mode == "pen"){
			ctx.globalCompositeOperation="source-over";
			ctx.moveTo(lastPos.x, lastPos.y);
			ctx.lineTo(mousePos.x, mousePos.y);
			ctx.stroke();
		}else if(mode == "eraser"){
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


// TOOD : Mobile code on below

// Set up touch events for mobile, etc
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

