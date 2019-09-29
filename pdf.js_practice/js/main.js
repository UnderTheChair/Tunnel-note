

//pdf default값 지정
let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null;


//렌더링 할 pdf크기 지정 (ex 1.5면 화면에서 크게 보이고, 0.5면 작게 축소되어 보임)
const scale = 1.5,
    canvas = document.querySelector('#pdf-render'),
    ctx = canvas.getContext('2d');

// 페이지 렌더링하는거
const renderPage = num =>{
    pageIsRendering = true; //초기 렌더링 default true로 변경

    //get page
    pdfDoc.getPage(num).then(page => {
        //set scale
        const viewport = page.getViewport({scale}); //페이지 크기 정보 가져오는거
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderCtx = {
            canvasContext:ctx,
            viewport
        } //renderContext객체 생성

        page.render(renderCtx).promise.then(() =>{
            pageIsRendering = false;

            if(pageNumIsPending !== null){
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });
        //현재페이지 보여주는거
        document.querySelector('#page-num').textContent = num;
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
}

//이전페이지 가는거
const showPrevPage = () =>{
    if(pageNum<=1){
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);

}
//다음 페이지 가는거
const showNextPage = () =>{
    if(pageNum>= pdfDoc.numPages){
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);

}

let inputElement = document.getElementById('input_file')
inputElement.onchange = function(event) {

    var file = event.target.files[0];

    //Step 2: Read the file using file reader
    var fileReader = new FileReader();

    fileReader.onload = function() {

        //Step 4:turn array buffer into typed array
        var typedarray = new Uint8Array(this.result);

        //Step 5:PDFJS should be able to read this
        pdfjsLib.getDocument(typedarray).promise.then(pdfDoc_ =>{
		      pdfDoc = pdfDoc_;
			  document.querySelector('#page-count').textContent = pdfDoc.numPages;

			  renderPage(pageNum);

		});


    };
    //Step 3:Read the file as ArrayBuffer
    fileReader.readAsArrayBuffer(file);

 }


//버튼 이벤트
document.querySelector('#prev-page').addEventListener('click', showPrevPage);
document.querySelector('#next-page').addEventListener('click', showNextPage);
