
import { TunnelBox } from './tunnel_box.js';

let tunnelBox = new TunnelBox();
function requestTunnelMode(){
    if(tunnelBox.getMode()){
        tunnelBox.terminate();
        return;
    }
    tunnelBox.request();
}

document.querySelector("#tunnelMode").addEventListener('click', requestTunnelMode);