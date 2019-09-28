var url = '../docs/sample.pdf';

onload = function(){

    showPDFContent();
}

function showPDFContent(){
    pdfjsLib.getDocument(url).then(onPDF);
}

function onPDF(pdf){
    pdf.getPage(1).then(onPage);
}

function onPage(page)
{
    var title = "";
    var viewport = page.getViewport(1.0);
    var pageDim = {width:0, height:0};
    pageDim.height = page.view[3];
    pageDim.width = page.view[2];
    var titleDim = {left:0, right:0, top:0, bottom:0};
    titleDim.left = pageDim.width * 0.2;
    titleDim.right = pageDim.width * 0.8;
    titleDim.top = 0;
    titleDim.bottom = pageDim.height * 0.17;
    console.log('pageDim', pageDim);
    console.log('titleDim', titleDim);

    page.getTextContent().then(getTitle);
    return;
    function getTitle(text){
        console.log('text', text);
        return;
    }
}