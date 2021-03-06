module.exports = {
    CanvasMousedown,
    CanvasMouseup,
    CanvasMousemove,
    drawTools,
    hideTools,
};

const remote = require('electron').remote;
let curWindow = remote.getCurrentWindow();
let bounds = curWindow.getBounds();
let curDisplay = require('electron').screen.getDisplayMatching(bounds);

const scaleFactor = curDisplay.scaleFactor;
// const {
//     outerWidth: screenWidth,
//     outerHeight: screenHeight,
// } = window;
let canvas = document.querySelector('#js-canvas');
let bgCanvas = document.querySelector('#bg-canvas');
let screenWidth = bgCanvas.style.width;
let screenHeight = bgCanvas.style.height;
let pos = {
    left: canvas.style.left,
    top: canvas.style.top,
};

let canvasWidth = 0;
let canvasHeight = 0;

let mousedown = false;
let sPoint = {
    x: 0,
    y: 0,
};

let ePoint = {
    x: 0,
    y: 0,
};

function CanvasMousedown(e) {
    e.preventDefault();
    e.stopPropagation();
    document.body.style.cursor = 'move';

    mousedown = true;
    sPoint = {
        x: e.clientX,
        y: e.clientY,
    };

    pos = {
        left: parseInt(canvas.style.left),
        top: parseInt(canvas.style.top),
    };

    canvasWidth = parseInt(canvas.style.width);
    canvasHeight = parseInt(canvas.style.height);

    screenWidth = parseInt(bgCanvas.width);
    screenHeight = parseInt(bgCanvas.height);

    hideTools();
}

function CanvasMousemove(e) {
    e.stopPropagation();
    e.preventDefault();
    if (!mousedown) {
        return;
    }

    ePoint = {
        x: e.clientX,
        y: e.clientY,
    };

    dragCanvas();
}

function CanvasMouseup(e) {
    e.stopPropagation();
    e.preventDefault();
    document.body.style.cursor = 'default';
    mousedown = false;
    drawTools([
        parseInt(canvas.style.left) + canvasWidth,
        parseInt(canvas.style.top) + canvasHeight,
    ]);
}

function dragCanvas() {
    let dis_x = ePoint.x - sPoint.x;
    let dis_y = ePoint.y - sPoint.y;

    // 边缘检测

    if (pos.left + dis_x <= 0) {
        dis_x = -pos.left;
    }

    if (pos.top + dis_y <= 0) {
        dis_y = -pos.top;
    }

    if (pos.top + dis_y + canvasHeight >= screenHeight) {
        dis_y = screenHeight - canvasHeight - pos.top;
    }

    if (pos.left + dis_x + canvasWidth >= screenWidth) {
        dis_x = screenWidth - canvasWidth - pos.left;
    }

    if (canvasWidth === 0 || canvasHeight === 0) {
        return;
    }

    canvas.style.cssText = `
        left: ${pos.left + dis_x}px; 
        top: ${pos.top + dis_y}px; 
        display: block;
        width: ${canvasWidth}px;
        height: ${canvasHeight}px;
    `;

    let imageData = bgCanvas
        .getContext('2d')
        .getImageData(
            (pos.left + dis_x) * scaleFactor,
            (pos.top + dis_y) * scaleFactor,
            canvasWidth * scaleFactor,
            canvasHeight * scaleFactor,
        );
    canvas
        .getContext('2d')
        .putImageData(
            imageData,
            0,
            0,
            0,
            0,
            canvasWidth * scaleFactor,
            canvasHeight * scaleFactor,
        );
}

/**
 * 绘制底部工具条
 */
function drawTools(curPoint) {
    let tools = document.querySelector('#js-toolbar');

    let width = tools.offsetWidth;
    tools.style.left = curPoint[0] - parseInt(width) + 'px';
    tools.style.top = curPoint[1] + 'px';
    tools.style.visibility = 'visible';
}

function hideTools() {
    let tools = document.querySelector('#js-toolbar');
    tools.style.visibility = 'hidden';
}
