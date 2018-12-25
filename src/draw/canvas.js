const nativeImage = require('electron').nativeImage
const fs = require('fs');
const path = require('path');
function domContentLoadedHandler() {
    console.log('lets go, dom content loaded');
    var mousedown = false;
    let hasLoadImage = true;
    var startPoint = [0, 0];
    let canvas = document.querySelector('#js-canvas');
    const mask = document.querySelector("#mask");
    console.log(mask);
    let imageData =fs.readFileSync(path.join(__dirname,'../../screenshot.png')).toString('utf-8');
    mask.addEventListener('mousedown', readyDrawCanvas, true);
    mask.addEventListener('mousemove', startDrawCanvas, true);
    mask.addEventListener('mouseup', endDrawCanvas, true);

    function readyDrawCanvas(e) {
        console.log(e);
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
        if(!mousedown) {
            return;
        }
        let curPoint = [e.clientX, e.clientY];
        console.log(curPoint);
        let width = e.clientX - startPoint[0];
        let height = e.clientY - startPoint[1];
        let image = nativeImage.createFromDataURL(imageData);
        let nimage = image.crop({
            x: startPoint[0], 
            y: startPoint[1],
            width: width,
            height: height,
        })
        console.log(image);
        canvas.width = width;
        canvas.height = height;
        canvas.style.cssText = `
            left: ${startPoint[0]}px;
            top: ${startPoint[1]}px;
            width: ${width};
            display:block;
            height: ${height};
        `;
        console.log(nimage.toPNG());
        
        hasLoadImage = false;
        let htmlImage = new Image();
        htmlImage.src = nimage.toDataURL();
        htmlImage.onload = htmlImage.complete = function() {
            hasLoadImage = true;
            canvas.getContext('2d').drawImage(htmlImage, 0, 0);
        }
        delete htmlImage;
        // canvas.getContext('2d').drawImage(nimage.toDataURL(), 0, 0);
        
    }

    function endDrawCanvas(e) {
        mousedown = false;
    }

}

module.exports = domContentLoadedHandler;