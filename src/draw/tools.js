const {remote, ipcRenderer, clipboard, nativeImage} = require('electron');
const fs = require('fs');
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
        this.audio = new Audio()
        this.audio.src = '../assets/audio/capture.mp3';
        this.btnGroup = ['btnClose','btnSquare','btnCircle','btnArrow', 'btnPen', 'btnDownload', 'btnOk'];
    }
    init() {

        this.btnGroup.forEach((btn) => {
            let handle = `${btn}ClickHandle`;
            console.log(handle, this[btn]);
            this[btn].addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('click on ', handle);
                this[handle]();
            }, false);
        })
    }

    btnCircleClickHandle() {

    }

    btnSquareClickHandle() {

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