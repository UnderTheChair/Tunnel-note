

//pdf default값 지정
let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null;

const pdf_render = document.getElementById('viewer')
    , container = document.getElementById('viewerContainer')
    , scale = 1.2;

// 페이지 렌더링하는거
const renderPage = num =>{
    pageIsRendering = true; //초기 렌더링 default true로 변경
    //get page
    pdfDoc.getPage(num).then(page => {
        //set scale
        const viewport = page.getViewport({scale}); //페이지 크기 정보 가져오는거
        pdf_render.height = viewport.height;
        pdf_render.width = viewport.width;

        page.getOperatorList()
            .then(function (opList) {
                
                var svgGfx = new pdfjsLib.SVGGraphics(page.commonObjs, page.objs);
                return svgGfx.getSVG(opList, viewport);
            })
            .then(function (svg) {
                
				if(pdf_render.hasChildNodes()===true){
				    pdf_render.replaceChild(svg,pdf_render.childNodes.item(0));
				}else{
				    pdf_render.appendChild(svg);
				}
            });

        //현재페이지 보여주는거
        document.querySelector('#page-num').textContent = num; 
        pageIsRendering = false;
    });

};

//렌더링 할 페이지수 확인
const queueRenderPage = num =>{
    if(pageIsRendering){
        pageNumIsPending = num;
    }
    else{
        renderPage(num);
    }
};

//이전페이지 가는거
const showPrevPage = () =>{
    if(pageNum<=1){
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);

};
//다음 페이지 가는거
const showNextPage = () =>{
    if(pageNum>= pdfDoc.numPages){
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);

};



let inputElement = document.getElementById('input_file')
inputElement.onchange = function(event) {

    let file = event.target.files[0];

    //Step 2: Read the file using file reader
    let fileReader = new FileReader();

    fileReader.onload = function() {

        //Step 4:turn array buffer into typed array
        let typedarray = new Uint8Array(this.result);

        //Step 5:PDFJS should be able to read this
        let loadingTask = pdfjsLib.getDocument(typedarray);


        loadingTask.promise.then((pdfDocument)=>{
            pdfDoc = pdfDocument;
            document.querySelector('#page-count').textContent = pdfDocument.numPages;
            renderPage(pageNum);
        })

    };
    //Step 3:Read the file as ArrayBuffer
    fileReader.readAsArrayBuffer(file);

 };


//버튼 이벤트
document.querySelector('#prev-page').addEventListener('click', showPrevPage);
document.querySelector('#next-page').addEventListener('click', showNextPage);
