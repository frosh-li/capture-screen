module.exports = {
    CanvasMousedown,
    CanvasMouseup,
    CanvasMousemove,
    drawTools,
    hideTools,
};

const {
    width: screenWidth,
    height: screenHeight,
} = require('electron').screen.getPrimaryDisplay().bounds;
const scaleFactor = require('electron').screen.getPrimaryDisplay().scaleFactor;
let canvas = document.querySelector('#js-canvas');
let bgCanvas = document.querySelector('#bg-canvas');

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
    console.log(e);
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
        return;
    }

    if (pos.top + dis_y <= 0) {
        return;
    }

    if (pos.top + dis_y + canvasHeight >= screenHeight) {
        return;
    }

    if (pos.left + dis_x + canvasWidth >= screenWidth) {
        return;
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
    tools.style.display = '-webkit-flex';
    let width = tools.offsetWidth;
    tools.style.left = curPoint[0] - parseInt(width) + 'px';
    tools.style.top = curPoint[1] + 'px';
}

function hideTools() {
    let tools = document.querySelector('#js-toolbar');
    tools.style.display = 'none';
}
