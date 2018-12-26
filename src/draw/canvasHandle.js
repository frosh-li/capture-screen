module.exports = {
    CanvasMousedown,
    CanvasMouseup, 
    CanvasMousemove,
};

let canvas = document.querySelector('#js-canvas');
let bgCanvas = document.querySelector('#bg-canvas');

let pos = {
    left: canvas.style.left,
    top: canvas.style.top,
}

let canvasWidth = canvas.width;
let canvasHeight = canvas.height;

let mousedown = false;
let inmove = false;
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
    document.body.style.cursor='move'; 
    console.log(e);
    mousedown = true;
    sPoint = {
        x: e.clientX,
        y: e.clientY,
    };

    pos = {
        left: parseInt(canvas.style.left),
        top: parseInt(canvas.style.top),
    }

    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
}

function CanvasMousemove(e) {
    e.stopPropagation();
    e.preventDefault();
    if (!mousedown || inmove) {
        return;
    }

    inmove = true;

    ePoint = {
        x: e.clientX,
        y: e.clientY,
    };

    dragCanvas();

}

function CanvasMouseup(e) {
    e.stopPropagation();
    e.preventDefault();
    document.body.style.cursor='default'; 
    mousedown = false;
    inmove = false;
}

function dragCanvas() {
    let dis_x = ePoint.x - sPoint.x;
    let dis_y = ePoint.y - sPoint.y;

    canvas.style.cssText = `
        left: ${pos.left + dis_x}px; 
        top: ${pos.top + dis_y}px; 
        display: block;
    `;

    let imageData = bgCanvas.getContext('2d').getImageData(
        pos.left + dis_x,
        pos.top + dis_y,
        canvasWidth,
        canvasHeight,
    );
    canvas.getContext('2d').putImageData(imageData, 0, 0);

    inmove = false;
}