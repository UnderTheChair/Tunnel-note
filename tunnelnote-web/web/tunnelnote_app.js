
import { TunnelBox } from './tunnel_box.js';
import { DrawService } from './drawing.js';

let canvas = document.getElementById('penContainer');

let tunnelBox = new TunnelBox();
let drawService = new DrawService(canvas);

drawService.enableMouseEventListener();

let penBtn = document.getElementById('penMode');
let eraserBtn = document.getElementById('eraserMode');

drawService.registerDrawToolButton(penBtn,"pen");
drawService.registerDrawToolButton(eraserBtn,"eraser");

