// Set up the canvas
let canvas = document.getElementById("sig-canvas");
let ctx = canvas.getContext("2d");

let mode = "pen";

// Set up mouse events for drawing
let drawing = false;
let mousePos = { x:0, y:0 };
let lastPos = mousePos;

// Set up the UI
let sigText = document.getElementById("sig-dataUrl");
let sigImage = document.getElementById("sig-image");
let clearBtn = document.getElementById("sig-clearBtn");
let penBtn = document.getElementById("sig-penBtn");
let eraserBtn = document.getElementById("sig-eraserBtn");
let submitBtn = document.getElementById("sig-submitBtn");

clearBtn.addEventListener("click", function (e) {
	clearCanvas();
	sigText.innerHTML = "Data URL for your signature will go here!";
	sigImage.setAttribute("src", "");
}, false);

penBtn.addEventListener("click", function(e) {
	ctx.strokeStyle = "blue";
	ctx.lineWith = 2;
	mode = "mode";
}, false);

//TODO : Not Working
eraserBtn.addEventListener("click", function (e) {
	// ctx.strokeStyle = "white";
	mode = "eraser";
}, false);

submitBtn.addEventListener("click", function (e) {
	let dataUrl = canvas.toDataURL();
	sigText.innerHTML = dataUrl;
	sigImage.setAttribute("src", dataUrl);
}, false);

let mousePenEvent = {
	mousedown(e){
		if(mode == "pen"){
			drawing = true;
			lastPos = getMousePos(canvas,e);
		}
	},
	mouseup(e){
		if (mode == "eraser"){
			eraserCanvas();
		}else if (mode == "pen"){
			drawing = false;
			eraserCanvas();
		}
	},
	mousemove(e){
		if (mode == "eraser"){
			eraserCanvas();	
		}
		else if (mode = "pen"){
			mousePos = getMousePos(canvas, e);
			renderCanvas();
		}

	}
}

function enablePenEventListener(){
	canvas.addEventListener("mousedown", mousePenEvent.mousedown, false);
	canvas.addEventListener("mouseup", mousePenEvent.mouseup, false);
	canvas.addEventListener("mousemove", mousePenEvent.mousemove, false);
};

enablePenEventListener();

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

// Get the position of the mouse relative to the canvas
function getMousePos(canvasDom, mouseEvent) {
	let rect = canvasDom.getBoundingClientRect();
	return {
		x: mouseEvent.clientX - rect.left,
		y: mouseEvent.clientY - rect.top
	};
}

// Get the position of a touch relative to the canvas
function getTouchPos(canvasDom, touchEvent) {
	let rect = canvasDom.getBoundingClientRect();
	return {
		x: touchEvent.touches[0].clientX - rect.left,
		y: touchEvent.touches[0].clientY - rect.top
	};
}

// Draw to the canvas
function renderCanvas() {
	if (drawing) {
		ctx.moveTo(lastPos.x, lastPos.y);
		ctx.lineTo(mousePos.x, mousePos.y);
		ctx.stroke();
		lastPos = mousePos;
	}
}

// TODO : Not Working
function eraserCanvas(){
	// ctx.globalCompositeOperation = "destination-out";  
	ctx.fillStyle = 'white';
	ctx.strokeStyle = 'rgba(0,0,0,1)';  
}

function clearCanvas() {
	canvas.width = canvas.width;
}
