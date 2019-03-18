const clipboard = require('electron').clipboard;
const nativeImage = require('electron').nativeImage;
const ipcRenderer = require('electron').ipcRenderer;
const mineType = require('mime-types');
const {
    CanvasMousedown,
    CanvasMouseup,
    CanvasMousemove,
    drawTools,
    hideTools,
} = require('./canvasHandle');

const remote = require('electron').remote;
const os = require('os');
const path = require('path');
const fs = require('fs');
let curWindow = remote.getCurrentWindow();
let bounds = curWindow.getBounds();
let curDisplay = require('electron').screen.getDisplayMatching(bounds);

const scaleFactor = curDisplay.scaleFactor;

function domContentLoadedHandler(_, arg) {
    let mousedown = false;
    let startPoint = [0, 0];
    let curPoint = [0, 0];
    let canvas = document.querySelector('#js-canvas');
    let bgCanvas = document.querySelector('#bg-canvas');

    bgCanvas.width = arg.width;
    bgCanvas.height = arg.height;

    const mask = document.querySelector('#mask');


    // if (platform === 'win32') {
    //     imageData = fs.readFileSync(`/screenshot${curDisplay.id}.png`).toString('utf-8');
    // } else {
    //     imageData = fs.readFileSync(path.join(__dirname,`../../screenshot${curDisplay.id}.png`)).toString('utf-8');
    // }
    // imageData = clipboard.readImage(curDisplay.id);
    // let image = nativeImage.createFromDataURL(imageData);
    
    let filePath = path.join(os.tmpdir(), curDisplay.id + '.png');
    // let image = nativeImage.createFromDataURL(imageData);
    let htmlImage = new Image();
    
    htmlImage.addEventListener('load',function() {
        console.log('load html success');
        bgCanvas.getContext('2d').drawImage(htmlImage, 0, 0);
        htmlImage = null;
    });
    htmlImage.src = filePath + '?' + (+new Date());
    // let base64 = 'data:' + mineType.lookup(filePath) + ';base64,' + imageData;
    // console.log('image base64', base64);
    // let htmlImage = new Image();
    // htmlImage.src = base64;
    // document.body.appendChild(htmlImage);
    // bgCanvas.getContext('2d').drawImage(htmlImage, 0, 0);
    //htmlImage = null;
    document.addEventListener('mousedown', readyDrawCanvas, false);
    document.addEventListener('mousemove', startDrawCanvas, false);
    document.addEventListener('mouseup', endDrawCanvas, false);

    canvas.addEventListener('mousedown', CanvasMousedown, false);
    canvas.addEventListener('mousemove', CanvasMousemove, false);
    canvas.addEventListener('mouseup', CanvasMouseup, false);

    // document.getElementById('TextInputBox').addEventListener('input', () => {
    //     let txt= document.getElementById('TextInputBox');
    //     if (txt.value === '') {
    //         txt.value = ' ';
    //     }
    // }, false);

    document.getElementById('TextInputBox').addEventListener(
        'blur',
        () => {
            let txt = document.getElementById('TextInputBox');
            txt.value = ' ';
        },
        false,
    );

    function readyDrawCanvas(e) {
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
        mousedown = false;
        if (
            Math.abs(curPoint[0] - startPoint[0]) > 0 &&
            Math.abs(curPoint[0] - startPoint[0]) > 0
        ) {
            document.removeEventListener('mousedown', readyDrawCanvas, false);
            document.removeEventListener('mousemove', startDrawCanvas, false);
            document.removeEventListener('mouseup', endDrawCanvas, false);
        }

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
        canvas.removeEventListener('mousedown', CanvasMousedown, false);
        canvas.removeEventListener('mousemove', CanvasMousemove, false);
        canvas.removeEventListener('mouseup', CanvasMouseup, false);
    });
}

module.exports = domContentLoadedHandler;
