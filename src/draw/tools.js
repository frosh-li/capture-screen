const {remote, ipcRenderer, clipboard, nativeImage} = require('electron');
const fs = require('fs');
const scaleFactor = require('electron').screen.getPrimaryDisplay().scaleFactor;
let canBeDrawShape = false;
let startToDrawShape = false;
class Toolbar {
    constructor() {
        this.btnClose = document.querySelector('#btn-close');
        this.btnSquare = document.querySelector('#btn-square');
        this.btnCircle = document.querySelector('#btn-circle');
        this.btnArrow = document.querySelector('#btn-arrow');
        this.btnPen = document.querySelector('#btn-pen');
        this.btnDownload = document.querySelector('#btn-download');
        this.btnOk = document.querySelector('#btn-ok');
        this.canvas = document.querySelector('#js-canvas');
        // this.zcanvas = document.querySelector('#zcanvas');
        // this.zcanvas.style.cssText = this.canvas.style.cssText;
        // this.zcanvas.style.css
        this.audio = new Audio()
        this.audio.src = '../assets/audio/capture.mp3';
        this.btnGroup = ['btnClose','btnSquare','btnCircle','btnArrow', 'btnPen', 'btnDownload', 'btnOk'];
        
        this.penColor = 'red';
    }
    init() {
        this.btnGroup.forEach((btn) => {
            let handle = `${btn}ClickHandle`;
            console.log(handle, this[btn]);
            this[btn].addEventListener('mousedown', (e) => {
                eventEmitter.emit('startDrawInCanvas');
                if (canBeDrawShape === false) {
                    this.initZrender();
                    canBeDrawShape = true;
                }
                e.preventDefault();
                e.stopPropagation();
                console.log('click on ', handle);
                this[handle]();
                
            }, false);
        })
    }

    /**
     * 将背景图绘制上来
     */
    initZrender() {
        

        let tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = this.canvas.width;
        tmpCanvas.height = this.canvas.height;
        let imageData = this.canvas.getContext('2d').getImageData(0,0,this.canvas.width,this.canvas.height);
        tmpCanvas.getContext('2d').putImageData(imageData, 0, 0, 0, 0, this.canvas.width,this.canvas.height);
        
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
        })
        tmpCanvas = null;
        this.zr.add(image);
        this.zr.on('mousedown', this.mousedown.bind(this), false);
        this.zr.on('mousemove', this.mousemove.bind(this), false);
        this.zr.on('mouseup', this.mouseup.bind(this), false);
    }

    mouseup() {
        startToDrawShape = false;
    }
    mousedown(e) {
        if(!this.shape) {
            return;
        }
        startToDrawShape = true;
        this.sPoint = {
            x: e.event.layerX * scaleFactor,
            y: e.event.layerY * scaleFactor,
        }
        if(this.shape === 'circle') {
            this.curShape = new zrender.Circle({
                shape: {
                    cx: -1000,
                    cy: -1000,
                    r: 1,
                },
            });
            this.zr.add(this.curShape);
        }

        if(this.shape === 'rect') {
            this.curShape = new zrender.Rect({
                shape: {
                    x: -1000,
                    y: -1000,
                    width: 1,
                    height: 1,
                },
            });
            this.zr.add(this.curShape);
        }
    }
    mousemove(e) {
        if(!startToDrawShape || !this.shape) {
            return;
        }
        console.log(e);
        this.ePoint = {
            x: e.event.layerX * scaleFactor,
            y: e.event.layerY * scaleFactor,
        }
        if(this.shape === 'rect') {
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
            })
        }

        if(this.shape === 'circle') {
            this.curShape.attr({
                shape: {
                    cx: (this.sPoint.x + this.ePoint.x) / 2,
                    cy: (this.sPoint.y + this.ePoint.y) / 2,
                    r: Math.abs(this.sPoint.x - this.ePoint.x) / 2,
                },
                style: {
                    fill: 'none',
                    stroke: 'red',
                    lineWidth: 4,
                },
                draggable: true,
                cursor: 'move',
            })
        }
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

    }

    btnPenClickHandle() {

    }

    btnDownloadClickHandle() {
        console.log(this.canvas);
        let url = this.canvas.toDataURL();
        remote.getCurrentWindow().hide();
        remote.dialog.showSaveDialog({
            filters: [{
                name: 'Images',
                extensions: ['png', 'jpg', 'gif'],
            }],
        }, path => {
            if(path) {
                //(path, new Buffer(url.replace('data:image/png;base64,', ''), 'base64'), () => {
                fs.writeFileSync(path, new Buffer(url.replace('data:image/png;base64,',''), 'base64'));
                ipcRenderer.send('closeapp');
            }else{
                ipcRenderer.send('closeapp');
            }
        })
    }

    btnOkClickHandle() {
        if (this.canvas.width === 0 || this.canvas.height === 0) {
            return;
        }
        let url = this.canvas.toDataURL();
        remote.getCurrentWindow().hide()

        this.audio.play()
        this.audio.onended = () => {
            ipcRenderer.send('closeapp');
        }
        clipboard.writeImage(nativeImage.createFromDataURL(url))
        
    }
}

module.exports = Toolbar;