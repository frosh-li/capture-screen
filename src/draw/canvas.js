const nativeImage = require('electron').nativeImage
const fs = require('fs');
const path = require('path');
const {CanvasMousedown, CanvasMouseup, CanvasMousemove} = require('./canvasHandle');
function domContentLoadedHandler(event, arg) {
    console.log('lets go, dom content loaded', arg);
    var mousedown = false;
    let hasLoadImage = true;
    var startPoint = [0, 0];
    let canvas = document.querySelector('#js-canvas');
    let bgCanvas = document.querySelector('#bg-canvas');
    bgCanvas.width = arg.width;
    bgCanvas.height = arg.height;

    
    const mask = document.querySelector("#mask");
    console.log(mask);
    let imageData =fs.readFileSync(path.join(__dirname,'../../screenshot.png')).toString('utf-8');

    let image = nativeImage.createFromDataURL(imageData);
    let htmlImage = new Image();
    htmlImage.src = image.toDataURL();
    htmlImage.onload = htmlImage.complete = function() {
        bgCanvas.getContext('2d').drawImage(htmlImage, 0, 0);
    }
    delete htmlImage;

    document.addEventListener('mousedown', readyDrawCanvas, false);
    document.addEventListener('mousemove', startDrawCanvas, false);
    document.addEventListener('mouseup', endDrawCanvas, false);

    canvas.addEventListener('mousedown', CanvasMousedown, false);
    canvas.addEventListener('mousemove', CanvasMousemove, false);
    canvas.addEventListener('mouseup', CanvasMouseup, false);

    function readyDrawCanvas(e) {
        console.log('mousedown backgrond');
        mousedown = true;
        startPoint[0] = e.clientX;
        startPoint[1] = e.clientY;
        canvas.style.cssText = `
            left: ${startPoint[0]}px;
            top: ${startPoint[1]}px;
            display: block;
            width: 0;
            height: 0;
        `;
    }

    function startDrawCanvas(e) {
        console.log('mousemove backgrond');
        if(!mousedown) {
            return;
        }
        let curPoint = [e.clientX, e.clientY];
        let width = e.clientX - startPoint[0];
        let height = e.clientY - startPoint[1];
        
        canvas.width = width;
        canvas.height = height;
        canvas.style.cssText = `
            left: ${startPoint[0]}px;
            top: ${startPoint[1]}px;
            width: ${width};
            display:block;
            height: ${height};
        `;
        if (width === 0 || height === 0) {
            return;
        }
        let imageData = bgCanvas.getContext('2d').getImageData(
            startPoint[0],
            startPoint[1],
            width,
            height,
        );
        canvas.getContext('2d').putImageData(imageData, 0, 0);
        
    }

    function endDrawCanvas(e) {
        mousedown = false;
    }


}

module.exports = domContentLoadedHandler;