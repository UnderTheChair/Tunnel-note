import { tunnelBoxSocket } from './socket.io.js';
import { screenControl } from './screen_control.js';
import { tunnelBox_app } from './tunnelnote_app.js';

var socketTimestamp = performance.now();
var scaleChanging = false;

function socketReady() {
  if(performance.now() - socketTimestamp > 0.05) {
    socketTimestamp = performance.now();
    return true;
  }
  return false;
}

class TunnelMobile {
  constructor() {
    this.on = false;
    // width = height * resolution
    this.resolution = 2;
    this.width = 300;
    this.height = 150;
    this.left = 0;
    this.top = 0;

    this.mobileWidth = 300;
    this.mobileHeight = 150;
    this.initScaleValue = 1.5;

    this.isHandMode = true;
    this.isDragByPC = false;
    this.isMobile = true;
  }
  rcvActivate() {
    this.on = true;
  }
  rcvDeactivate() {
    this.on = false;
  }

  getPosition() {
    let pdfViewer = window.PDFViewerApplication.pdfViewer;
    let clientX, clientY;
    let currentPage = pdfViewer._location.pageNumber;
    let x, y, p1, p2;
    
    clientX = this.left - document.querySelector(`#viewer > div:nth-child(${currentPage})`).offsetLeft;
    clientY = this.top;

    // pt1 has [x, y] converted to PDF point
    [x, y]= pdfViewer._pages[0].viewport.convertToPdfPoint(clientX, clientY);
    p1 = {x : x, y : y};

    [x, y] = pdfViewer._pages[0].viewport.convertToPdfPoint(clientX + this.width, clientY - this.height);
    p2 = {x : x, y : y};

    if(p1.y <= 0){
      currentPage = 1;
    }

    return {
      pagePoint : [p1, p2],
      currentPage : currentPage,
      // For setting size of screen corresponded with the tunnel box
      width: document.body.clientWidth,
      currentScale : pdfViewer.currentScale,
      boxHeight : this.height,
      boxWidth : this.width
    }
  }

  //mobile
  setMobilePosition(position) {
    let {pagePoint, currentPage} = position;
    let pdfViewer = window.PDFViewerApplication.pdfViewer;
    let currentPageElment = document.querySelector(`#viewer > div:nth-child(${currentPage})`);
    let x, y, p1;
    
    [x, y] = pdfViewer._pages[0].viewport.convertToViewportPoint(pagePoint[0].x, pagePoint[0].y);
    p1 = {x : x, y : y}; 

    this.left = p1.x + currentPageElment.offsetLeft;
    this.top = p1.y;
    
    screenControl.setScrollTop(currentPageElment.offsetTop + this.top);
    screenControl.setScrollLeft(currentPageElment.offsetLeft + this.left);
  }
  setMobileSize(position){
    let pdfViewer = window.PDFViewerApplication.pdfViewer;

    screenControl.setOffsetWidth(position.boxWidth);
    screenControl.setOffsetHeight(position.boxHeight);

    var newScale = (document.body.clientWidth / (position.width / position.currentScale)) * (position.width / position.boxWidth);
    scaleChanging = true;
    pdfViewer._setScale(newScale);
    scaleChanging = false;
  }
  setMobileSizeValue(width, height){
    this.width = width;
    this.height = height;
    this.resolution = this.width / this.height;
  }
  setPos(){
    this.top = document.querySelector('#viewerContainer').scrollTop;
    this.left = document.querySelector('#viewerContainer').scrollLeft;
  }
}

let tunnel;
let toolbar_height = document.getElementById('toolbarContainer').offsetHeight;
let isMobileScroll = false;
let isMobileResize = false;
let isInit = false;

//pc -> mobile
tunnelBoxSocket.on('BOX_INIT', (position) => {
  console.log("box init");
  if(!isInit){
    tunnel = tunnelBox_app;

    //add event for detect mobile window control
    $('#viewerContainer').scroll(function(event){
      isMobileScroll = true;
    });
    // window.addEventListener("resize", function(){
    //   console.log("is mobile resize: ", isMobileResize);
    //   isMobileResize = true;
    // }, false);
    setAllInterval();
    window.addEventListener("orientationchange", function(){
      tunnelBoxSocket.emit('MOBILE_ROTATE', null);
    }, false);

    isInit = true;
  }
  if (tunnel.on == true) return;
  tunnel.on = true;
  if(tunnel === undefined) return;
  
  //set tunnel size value by mobile screen size
  var mobileWidth = $( window ).width();
  var mobileHeight = $( window ).height() - toolbar_height;

  tunnelBoxSocket.emit('BOX_SIZE_INIT', { 
    width: mobileWidth, 
    height: mobileHeight
  });
  tunnel.setMobileSizeValue(mobileWidth, mobileHeight);
  position.boxHeight = mobileHeight / tunnel.initScaleValue;
  position.boxWidth = mobileWidth / tunnel.initScaleValue;
  tunnel.setMobileSize(position);
  tunnel.rcvActivate();
});

tunnelBoxSocket.on('BOX_MOVE', (position) => {
  // Temporary remove for continue operating when page referch at remote device
  if (tunnel.on == false ) return;
  tunnel.isDragByPC = true;
  tunnel.setMobilePosition(position);
  setTimeout(function(){
    tunnel.isDragByPC = false;
  }, 1000);
  
});

tunnelBoxSocket.on('BOX_RESIZE', (position) => {
  tunnel.isDragByPC = true;
  tunnel.setMobileSize(position);
  tunnel.setMobilePosition(position);
  setTimeout(function(){
    tunnel.isDragByPC = false;
  }, 500);
});

tunnelBoxSocket.on('BOX_CLEAR', (position) => {
  if (tunnel.on == false) return;
  tunnel.rcvDeactivate();
});

tunnelBoxSocket.on('BOX_DOWN', (position) => {
  if (tunnel.on = false) return;
});

tunnelBoxSocket.on('DISCONNECT', () => {
  if (tunnel === undefined) return;
  tunnel.rcvDeactivate();
});

//set mobile Interval about scroll, resize
function setAllInterval(){
  setInterval(function(){
    if(isMobileScroll && !tunnel.isDragByPC){
      mobileScrollCallback();
    }
    if(isMobileResize && !scaleChanging && socketReady()){
      mobileResizeCallback();
    }
    isMobileScroll = false;
    isMobileResize = false;
  }, 100);
}

function mobileScrollCallback() {
  if(!tunnel.isDragByPC){
    tunnel.setPos();
    var position = tunnel.getPosition();
    if(socketReady()) tunnelBoxSocket.emit('MOBILE_MOVE', position);
  }
};
function mobileResizeCallback() {
  tunnel.setPos();
  var position = tunnel.getPosition();
  tunnelBoxSocket.emit('MOBILE_RESIZE', position);
  window.drawService.updateCanvas();
}

export { TunnelMobile, };