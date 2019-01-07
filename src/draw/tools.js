const { remote, ipcRenderer, clipboard, nativeImage } = require('electron');
const fs = require('fs');
let curWindow = remote.getCurrentWindow();
let bounds = curWindow.getBounds();
let curDisplay = require('electron').screen.getDisplayMatching(bounds);
console.log(curDisplay);
console.log('current window', curWindow);
const scaleFactor = curDisplay.scaleFactor;
let canBeDrawShape = false;
let startToDrawShape = false;
let dragingShape = false;
let pathArray = [];

// 继承箭头形状
let ArrowShape = new zrender.Path.extend({
    type: 'Arrow',
    shape: {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
    },
    buildPath: function(path, shape) {
        const { x1, x2, y1, y2 } = shape;

        let angle = Math.atan2(y1 - y2, x2 - x1); //弧度  0.6435011087932844
        let theta = angle * (180 / Math.PI); //角度  36.86989764584402
        console.log('角度', theta);
        let dis = Math.sqrt(
            Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2),
        );
        path.moveTo(x1, y1);
        path.lineTo(
            x1 + (dis - 20) * Math.cos(((theta - 2) * Math.PI) / 180),
            y1 - (dis - 20) * Math.sin(((theta - 2) * Math.PI) / 180),
        );
        path.lineTo(
            x1 + (dis - 30) * Math.cos(((theta - 5) * Math.PI) / 180),
            y1 - (dis - 30) * Math.sin(((theta - 5) * Math.PI) / 180),
        );
        path.lineTo(x2, y2);
        path.lineTo(
            x1 + (dis - 30) * Math.cos(((theta + 5) * Math.PI) / 180),
            y1 - (dis - 30) * Math.sin(((theta + 5) * Math.PI) / 180),
        );
        path.lineTo(
            x1 + (dis - 20) * Math.cos(((theta + 2) * Math.PI) / 180),
            y1 - (dis - 20) * Math.sin(((theta + 2) * Math.PI) / 180),
        );

        path.lineTo(x1, y1);
        path.closePath();
    },
});
class Toolbar {
    constructor() {
        this.btnClose = document.querySelector('#btn-close');
        this.btnSquare = document.querySelector('#btn-square');
        this.btnCircle = document.querySelector('#btn-circle');
        this.btnArrow = document.querySelector('#btn-arrow');
        this.btnPen = document.querySelector('#btn-pen');
        this.btnDownload = document.querySelector('#btn-download');
        this.btnText = document.querySelector('#btn-text');
        this.btnOk = document.querySelector('#btn-ok');
        this.canvas = document.querySelector('#js-canvas');
        this.textInputBox = document.querySelector('#TextInputBox');
        this.audio = new Audio();
        this.audio.src = '../assets/audio/capture.mp3';
        this.btnGroup = [
            'btnClose',
            'btnSquare',
            'btnCircle',
            'btnArrow',
            'btnPen',
            'btnDownload',
            'btnOk',
            'btnText',
        ];

        this.penColor = 'red';
    }
    init() {
        this.btnGroup.forEach(btn => {
            let handle = `${btn}ClickHandle`;
            console.log(handle, this[btn]);
            this[btn].addEventListener(
                'mousedown',
                e => {
                    this.setToolbarHighlight(btn);
                    eventEmitter.emit('startDrawInCanvas');
                    if (canBeDrawShape === false) {
                        this.initZrender();
                        canBeDrawShape = true;
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('click on ', handle);
                    this[handle]();
                },
                false,
            );
        });

        ipcRenderer.on('deleteShape', () => {
            if (this.curShape) {
                this.zr.remove(this.curShape);    
            }
        });
    }

    //高亮当前图形按钮
    setToolbarHighlight(btn) {
        // console.log('highlight btn', btn);
        this.btnGroup.forEach(_btn => {
            if (btn === _btn) {
                console.log('highlight btn', btn, this[btn]);
                this[_btn].style.color = 'red';
            } else {
                this[_btn].style.color = '#333';
            }
        });
    }

    /**
     * 将背景图绘制上来
     */
    initZrender() {
        let tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = this.canvas.width;
        tmpCanvas.height = this.canvas.height;
        let imageData = this.canvas
            .getContext('2d')
            .getImageData(0, 0, this.canvas.width, this.canvas.height);
        tmpCanvas
            .getContext('2d')
            .putImageData(
                imageData,
                0,
                0,
                0,
                0,
                this.canvas.width,
                this.canvas.height,
            );

        this.zr = zrender.init(this.canvas);

        this.zr.clear();

        let image = new zrender.Image({
            style: {
                image: tmpCanvas,
                x: 0,
                y: 0,
                sx: 0,
                sy: 0,
                width: parseInt(this.canvas.width),
                height: parseInt(this.canvas.height),
                sWidth: parseInt(this.canvas.width),
                sHeight: parseInt(this.canvas.height),
            },
        });
        tmpCanvas = null;
        this.zr.add(image);
        this.zr.on('mousedown', this.mousedown.bind(this), false);
        this.zr.on('mousemove', this.mousemove.bind(this), false);
        this.zr.on('mouseup', this.mouseup.bind(this), false);
        this.canvas.addEventListener(
            'keypress',
            e => {
                console.log(e);
            },
            false,
        );
    }

    mouseup() {
        startToDrawShape = false;
    }
    mousedown(e) {
        if (!this.shape || dragingShape) {
            return;
        }
        startToDrawShape = true;
        this.sPoint = {
            x: e.event.layerX * scaleFactor,
            y: e.event.layerY * scaleFactor,
        };

        if (this.shape === 'text') {

            setTimeout(() => {
                this.textInputBox.focus();
            },0);
            this.textInputBox.addEventListener('input', () => {
                console.log(this.textInputBox.value);
                let sx = this.sPoint.x - 15 * scaleFactor;
                let sy = this.sPoint.y - 15 * scaleFactor;
                if ( sx <= 0) {
                    sx = 0;
                }
                if (sy <= 0) {
                    sy = 0;
                }
                let bounds = this.curShape.getBoundingRect();
                if (bounds.x + bounds.width >= this.canvas.width - 10) {
                    this.textInputBox.value += '\n';
                }
                this.curShape.attr({
                    style: {
                        text: this.textInputBox.value === '' ? ' ': this.textInputBox.value,
                    },
                    position: [sx, sy],
                });
            }, false);
            
            console.log(this.curShape);
            if (this.curShape && this.curShape.__proto__.type === 'text' && this.curShape.style.text === '') {
                this.zr.remove(this.curShape);
            }
            let sx = this.sPoint.x - 15 * scaleFactor;
            let sy = this.sPoint.y - 15 * scaleFactor;
            if ( sx <= 0) {
                sx = 0;
            }
            if (sy <= 0) {
                sy = 0;
            }
            this.curShape = new zrender.Text({
                rectHover: true,
                draggable: true,
                cursor: 'move',
                style: {
                    textFill: this.penColor,
                    textStroke: this.penColor,
                    lineWidth: 2,
                    fontFamily: '微软雅黑',
                    fontSize: 18 * scaleFactor,
                    textPadding: 7 * scaleFactor,
                    textWidth: '100',
                    textLineHeight: 30 * scaleFactor,
                    textBorderColor: this.penColor,
                    textBorderWidth: 2,
                    text: ' ',
                },
                position: [sx, sy],
            });
            // pt = px * dpi / 72
            this.setEvents(this.curShape);
            this.zr.add(this.curShape);
            this.textInputBox.focus();
        }

        if (this.shape === 'circle') {
            this.curShape = new zrender.Ellipse({
                shape: {
                    cx: -1000,
                    cy: -1000,
                    rx: 1,
                    ry: 1,
                },
            });
            this.setEvents(this.curShape);
            this.zr.add(this.curShape);
        }

        if (this.shape === 'rect') {
            this.curShape = new zrender.Rect({
                shape: {
                    x: -1000,
                    y: -1000,
                    width: 1,
                    height: 1,
                },
            });
            this.setEvents(this.curShape);
            this.zr.add(this.curShape);
        }

        if (this.shape === 'path') {
            pathArray = [[this.sPoint.x, this.sPoint.y]];
            this.curShape = new zrender.Polyline({
                shape: {
                    points: pathArray,
                },
            });
            this.setEvents(this.curShape);
            this.zr.add(this.curShape);
        }

        if (this.shape === 'arrow') {
            this.curShape = new ArrowShape({
                shape: {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 0,
                },
            });
            this.setEvents(this.curShape);
            this.zr.add(this.curShape);
        }
    }
    setEvents(curShape) {
        curShape
            .on('mousedown', () => {
                dragingShape = true;
                this.curShape = curShape;
            })
            .on('mouseup', () => {
                dragingShape = false;
            });
    }
    mousemove(e) {
        if (!startToDrawShape || !this.shape) {
            return;
        }
        this.ePoint = {
            x: e.event.layerX * scaleFactor,
            y: e.event.layerY * scaleFactor,
        };
        if (this.shape === 'rect') {
            this.curShape.attr({
                shape: {
                    x: this.sPoint.x,
                    y: this.sPoint.y,
                    width: Math.abs(this.ePoint.x - this.sPoint.x),
                    height: Math.abs(this.ePoint.y - this.sPoint.y),
                },
                style: {
                    fill: 'none',
                    stroke: 'red',
                    lineWidth: 4,
                },
                draggable: true,
                cursor: 'move',
            });
        }

        if (this.shape === 'circle') {
            this.curShape.attr({
                shape: {
                    cx: (this.sPoint.x + this.ePoint.x) / 2,
                    cy: (this.sPoint.y + this.ePoint.y) / 2,
                    rx: Math.abs(this.sPoint.x - this.ePoint.x) / 2,
                    ry: Math.abs(this.sPoint.y - this.ePoint.y) / 2,
                },
                style: {
                    fill: 'none',
                    stroke: 'red',
                    lineWidth: 4,
                },
                draggable: true,
                cursor: 'move',
            });
        }

        if (this.shape === 'path') {
            pathArray.push([this.ePoint.x, this.ePoint.y]);
            console.log(pathArray);
            this.curShape.attr({
                shape: {
                    points: pathArray,
                },
                style: {
                    fill: 'none',
                    stroke: 'red',
                    lineWidth: 4,
                },
                draggable: true,
                cursor: 'move',
            });
        }

        if (this.shape === 'arrow') {
            this.curShape.attr({
                shape: {
                    x1: this.sPoint.x,
                    y1: this.sPoint.y,
                    x2: this.ePoint.x,
                    y2: this.ePoint.y,
                },
                style: {
                    fill: 'red',
                    stroke: 'red',
                    lineWidth: 1,
                },
                draggable: true,
                cursor: 'move',
            });
        }

        if (this.shape === 'text') {
            this.curShape.attr({
                rectHover: true,
                draggable: true,
                cursor: 'move',
                style: {
                    textPosition: [this.ePoint.x, this.ePoint.y],
                }
            });
        }
    }

    btnTextClickHandle() {
        this.shape = 'text';
    }

    btnCircleClickHandle() {
        this.shape = 'circle';
    }

    // 开始绘制正方形
    btnSquareClickHandle() {
        this.shape = 'rect';
    }

    btnCloseClickHandle() {
        remote.getCurrentWindow().hide();
        ipcRenderer.send('closeapp');
    }

    btnArrowClickHandle() {
        this.shape = 'arrow';
    }

    btnPenClickHandle() {
        this.shape = 'path';
    }

    btnDownloadClickHandle() {
        console.log(this.canvas);
        let url = this.canvas.toDataURL();
        remote.getCurrentWindow().hide();
        remote.dialog.showSaveDialog(
            {
                filters: [
                    {
                        name: 'Images',
                        extensions: ['png', 'jpg', 'gif'],
                    },
                ],
            },
            path => {
                if (path) {
                    //(path, new Buffer(url.replace('data:image/png;base64,', ''), 'base64'), () => {
                    fs.writeFileSync(
                        path,
                        new Buffer(
                            url.replace('data:image/png;base64,', ''),
                            'base64',
                        ),
                    );
                    ipcRenderer.send('closeapp');
                } else {
                    ipcRenderer.send('closeapp');
                }
            },
        );
    }

    btnOkClickHandle() {
        if (this.canvas.width === 0 || this.canvas.height === 0) {
            return;
        }
        let url = this.canvas.toDataURL();
        remote.getCurrentWindow().hide();

        this.audio.play();
        this.audio.onended = () => {
            ipcRenderer.send('closeapp');
        };
        clipboard.writeImage(nativeImage.createFromDataURL(url));
    }
}

module.exports = Toolbar;
