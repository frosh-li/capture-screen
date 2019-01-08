const {
    desktopCapturer,
    ipcRenderer,
    remote,
    clipboard,
    nativeImage,
} = require('electron'); // In the renderer process.

let events = require('events');
global.eventEmitter = new events.EventEmitter();
const os = require('os');
const platform = os.platform();
let displayIndex = 0;
const domContentLoadedHandler = require('../draw/canvas');
let curWindow = remote.getCurrentWindow();
let bounds = curWindow.getBounds();
let curDisplay = require('electron').screen.getDisplayMatching(bounds);

let allDisplay = require('electron').screen.getAllDisplays();

allDisplay.forEach((dis, i) => {
    if (dis.id == curDisplay.id) {
        displayIndex = i;
    }
});

function startCapture() {
    desktopCapturer.getSources(
        {
            types: ['screen'],
        },
        (error, sources) => {
            if (error) throw error;
            let curSource = sources[displayIndex];

            navigator.mediaDevices
                .getUserMedia({
                    audio: false,
                    video: {
                        mandatory: {
                            chromeMediaSource: 'desktop',
                            chromeMediaSourceId: curSource.id,
                            minWidth: 1280,
                            maxWidth: 8000,
                            minHeight: 720,
                            maxHeight: 8000,
                        },
                    },
                })
                .then(stream => handleStream(stream))
                .catch(e => handleError(e));
        },
    );
}

function handleStream(stream) {
    const video = document.createElement('video');
    video.srcObject = stream;
    let hasShot = false;
    video.onloadedmetadata = e => {
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
        document.body.style.backgroundImage = `url(${imageData})`;
        document.body.removeChild(video);

        const tracks = stream.getTracks();
        tracks[0].stop();
        clipboard.writeImage(
            nativeImage.createFromDataURL(imageData),
            curDisplay.id,
        );

        setImmediate(() => {
            // curWindow.maximize();
            // curWindow.getNativeWindowHandle().
            curWindow.setFullScreen(true);
            curWindow.show();
            curWindow.webContents.openDevTools();
            ipcRenderer.send('fullscreen', {
                type: 'setfull',
                width: canvas.width,
                height: canvas.height,
                win: curWindow,
            }); // 通知最大化窗口
        });
    };

    document.body.appendChild(video);
}

function handleError() {}

ipcRenderer.on('startCapture', () => {
    setImmediate(() => {
        startCapture();
    });
});
ipcRenderer.on('handleEvent', (event, arg) => {
    domContentLoadedHandler(event, arg);
});


// window.addEventListener('keypress', (e) => {
//     console.log(e);
//     return true;
// }, true);