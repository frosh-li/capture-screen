const nativeImage = require('electron').nativeImage;
const fs = require('fs');
const path = require('path');
const os = require('os');
const platform = os.platform();
const {
    CanvasMousedown,
    CanvasMouseup,
    CanvasMousemove,
    drawTools,
    hideTools,
} = require('./canvasHandle');

const remote = require('electron').remote;
let curWindow = remote.getCurrentWindow();
let bounds = curWindow.getBounds();
let curDisplay = require('electron').screen.getDisplayMatching(bounds);
console.log(curDisplay);
console.log('current window', curWindow);
const scaleFactor = curDisplay.scaleFactor;

function domContentLoadedHandler(_, arg) {
    console.log('lets go, dom content loaded', arg);
    let mousedown = false;
    let startPoint = [0, 0];
    let curPoint = [0, 0];
    let canvas = document.querySelector('#js-canvas');
    let bgCanvas = document.querySelector('#bg-canvas');

    bgCanvas.width = arg.width;
    bgCanvas.height = arg.height;

    const mask = document.querySelector('#mask');
    console.log(mask);
    let imageData;
    if (platform === 'win32') {
        imageData = fs.readFileSync(`/screenshot${curDisplay.id}.png`).toString('utf-8');
    } else {
        imageData = fs.readFileSync(path.join(__dirname,`../../screenshot${curDisplay.id}.png`)).toString('utf-8');
    }
    let image = nativeImage.createFromDataURL(imageData);
    let htmlImage = new Image();
    htmlImage.src = image.toDataURL();
    htmlImage.onload = htmlImage.complete = function() {
        bgCanvas.getContext('2d').drawImage(htmlImage, 0, 0);
        htmlImage = null;
    };
    // 

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
        if (!mousedown) {
            return;
        }
        console.log('mousemove backgrond');
        curPoint = [e.clientX, e.clientY];
        let width = Math.abs(e.clientX - startPoint[0]);
        let height = Math.abs(e.clientY - startPoint[1]);

        canvas.width = width * scaleFactor;
        canvas.height = height * scaleFactor;
        canvas.style.cssText = `
            left: ${Math.min(startPoint[0], curPoint[0])}px;
            top: ${Math.min(startPoint[1], curPoint[1])}px;
            width: ${width}px;
            display:block;
            height: ${height}px;
        `;
        if (width === 0 || height === 0) {
            return;
        }
        let imageData = bgCanvas
            .getContext('2d')
            .getImageData(
                Math.min(startPoint[0], curPoint[0]) * scaleFactor,
                Math.min(startPoint[1], curPoint[1]) * scaleFactor,
                width * scaleFactor,
                height * scaleFactor,
            );
        canvas
            .getContext('2d')
            .putImageData(
                imageData,
                0,
                0,
                0,
                0,
                width * scaleFactor,
                height * scaleFactor,
            );
    }

    function endDrawCanvas(e) {
        console.log('document mouse up');
        mousedown = false;
        setTimeout(() => {
            drawTools([
                Math.max(curPoint[0], startPoint[0]),
                Math.max(curPoint[1], startPoint[1]),
            ]);
        }, 0);
    }

    const Toolbar = require('../draw/tools');
    new Toolbar().init();

    eventEmitter.on('startDrawInCanvas', () => {
        console.log('handle event');
        document.removeEventListener('mousedown', readyDrawCanvas, false);
        document.removeEventListener('mousemove', startDrawCanvas, false);
        document.removeEventListener('mouseup', endDrawCanvas, false);

        canvas.removeEventListener('mousedown', CanvasMousedown, false);
        canvas.removeEventListener('mousemove', CanvasMousemove, false);
        canvas.removeEventListener('mouseup', CanvasMouseup, false);
    });
}

module.exports = domContentLoadedHandler;
