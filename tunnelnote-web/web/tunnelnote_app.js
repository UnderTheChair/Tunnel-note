
import { TunnelBox } from './tunnel_box.js';
import { DrawService } from './drawing.js';

let canvas = document.getElementById('pdf-canvas');

let tunnelBox = new TunnelBox();
let drawService = new DrawService(canvas);

drawService.enableMouseEventListener();

