// In the renderer process.
console.log('preload');
const {
    desktopCapturer,
    remote,
    screen,
    ipcRenderer,
    
} = require('electron')

let events = require('events');
global.eventEmitter = new events.EventEmitter();

const domContentLoadedHandler = require('../draw/canvas');
const fs = require('fs');
const scaleFactor = screen.getPrimaryDisplay().scaleFactor;
console.log('屏幕缩放比', screen.getPrimaryDisplay().scaleFactor);

function startCapture() {
    desktopCapturer.getSources({
        types: ['screen']
    }, (error, sources) => {
        if (error) throw error
        let curSource = sources[0];
    
        navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: curSource.id,
                        minWidth: 1280,
                        maxWidth: 8000,
                        minHeight: 720,
                        maxHeight: 8000,
                    }
                }
            }).then((stream) => handleStream(stream))
            .catch((e) => handleError(e))
    })
}


function handleStream(stream) {
    const video = document.createElement('video');
    video.srcObject = stream;
    let hasShot = false;
    video.onloadedmetadata = (e) => {
        console.log('metaloaded');
        if (hasShot) {
            return;
        }
        hasShot = true;
        video.play();
        video.pause();
        let canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        let ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        let imageData = canvas.toDataURL('image/png', 1);
        // document.body.style.width = video.videoWidth + 'px';
        // document.body.style.height = video.videoHeight + 'px';
        document.body.style.backgroundImage = `url(${imageData})`;
        document.body.removeChild(video);

        const tracks = stream.getTracks()
        tracks[0].stop()

        fs.writeFileSync('./screenshot.png', imageData);
        //fs.writeFileSync('./screenshot_main.png', Buffer.from(imageData.replace('data:image/png;base64,',''), 'base64'));
        setImmediate(() => {
            ipcRenderer.send('fullscreen', {
                type: 'setfull',
                width: canvas.width,
                height: canvas.height,
            }); // 通知最大化窗口
        });   
    }

    document.body.appendChild(video);
}

function handleError(e) {
    console.log(e)
}

ipcRenderer.on('startCapture', () => {
    console.log('startCapture');
    setImmediate(() => {
        startCapture();
    })
});
ipcRenderer.on('handleEvent', (event,arg) => {
    domContentLoadedHandler(event, arg)
});
