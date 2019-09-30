// URL of PDF document  -> pdf 첫페이지 렌더링
var url = "../docs/sample.pdf";

// Asynchronous download PDF
pdfjsLib.getDocument(url)
  .then(function(pdf) {
    return pdf.getPage(1);
  })
  .then(function(page) {
    // Set scale (zoom) level
    var scale = 1.5;

    // Get viewport (dimensions)
    var viewport = page.getViewport(scale);

    // Get canvas#the-canvas
    var canvas = document.getElementById('the-canvas');

    // Fetch canvas' 2d context
    var context = canvas.getContext('2d');

    // Set dimensions to Canvas
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Prepare object needed by render method
    var renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    page.render(renderContext);
    });
