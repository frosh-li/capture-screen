const nativeImage = require('electron').nativeImage
const fs = require('fs');
const path = require('path');
const {CanvasMousedown, CanvasMouseup, CanvasMousemove, drawTools, hideTools} = require('./canvasHandle');
const scaleFactor = require('electron').screen.getPrimaryDisplay().scaleFactor;
function domContentLoadedHandler(event, arg) {
    
    console.log('lets go, dom content loaded', arg);
    let mousedown = false;
    
    let startPoint = [0, 0];
    let curPoint = [0, 0];
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
        hideTools();
    }

    function startDrawCanvas(e) {
        
        if(!mousedown) {
            return;
        }
        console.log('mousemove backgrond');
        curPoint = [e.clientX, e.clientY];
        let width = e.clientX - startPoint[0];
        let height = e.clientY - startPoint[1];
        
        canvas.width = width * scaleFactor;
        canvas.height = height * scaleFactor;
        canvas.style.cssText = `
            left: ${startPoint[0]}px;
            top: ${startPoint[1]}px;
            width: ${width}px;
            display:block;
            height: ${height}px;
        `;
        if (width === 0 || height === 0) {
            return;
        }
        let imageData = bgCanvas.getContext('2d').getImageData(
            startPoint[0] * scaleFactor,
            startPoint[1] * scaleFactor,
            width * scaleFactor,
            height * scaleFactor,
        );
        // let cacheCanvas = document.createElement('canvas');
        // cacheCanvas.width = width * scaleFactor * scaleFactor;
        // cacheCanvas.height = height * scaleFactor * scaleFactor;
        // cacheCanvas.getContext('2d').putImageData(imageData, 0, 0, 0, 0, width * scaleFactor * scaleFactor, height * scaleFactor * scaleFactor);
        // canvas.getContext('2d').drawImage(cacheCanvas, 0, 0, width * scaleFactor, height * scaleFactor, 0, 0, width, height);

        canvas.getContext('2d').putImageData(imageData, 0, 0, 0, 0,width * scaleFactor, height * scaleFactor);
        
    }

    function endDrawCanvas(e) {
        console.log('document mouse up');
        mousedown = false;
        setTimeout(() => {
            drawTools(curPoint);
        },0)
    }


    const Toolbar = require('../draw/tools');
    new Toolbar().init();
}

module.exports = domContentLoadedHandler;