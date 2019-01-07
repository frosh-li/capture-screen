// In the renderer process.
console.log('preload');
const { desktopCapturer, ipcRenderer, remote, clipboard, nativeImage } = require('electron');
let events = require('events');
global.eventEmitter = new events.EventEmitter();
const os = require('os');
const platform = os.platform();
let displayIndex = 0;
const domContentLoadedHandler = require('../draw/canvas');
let curWindow = remote.getCurrentWindow();
let bounds = curWindow.getBounds();
let curDisplay = require('electron').screen.getDisplayMatching(bounds);
console.log('curDisplay', curDisplay);
console.log('current window', curWindow);
let allDisplay = require('electron').screen.getAllDisplays();
console.log('all Display', allDisplay);
allDisplay.forEach( (dis, i) => {
    if(dis.id == curDisplay.id) {
        displayIndex = i;
    }
});

function startCapture() {
    desktopCapturer.getSources(
        {
            types: ['screen'],
        },
        (error, sources) => {
            console.log('all source', sources, 'displayIndex', displayIndex);
            if (error) throw error;
            let curSource = sources[displayIndex];

            console.log(curSource);
            
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
        document.body.style.backgroundImage = `url(${imageData})`;
        document.body.removeChild(video);

        const tracks = stream.getTracks();
        tracks[0].stop();
        clipboard.writeImage(nativeImage.createFromDataURL(imageData), curDisplay.id);
        // if (platform === 'win32') {
        //     fs.writeFileSync(`/screenshot${curDisplay.id}.png`, imageData);
            
        // } else {
        //     fs.writeFileSync(path.join(__dirname,`../../screenshot${curDisplay.id}.png`), imageData);
        // }

        setImmediate(() => {
            // curWindow.maximize();
            // curWindow.getNativeWindowHandle().
            curWindow.setFullScreen(true);
            curWindow.show();
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

function handleError(e) {
    console.log(e);
}

ipcRenderer.on('startCapture', () => {
    console.log('startCapture');
    setImmediate(() => {
        startCapture();
    });
});
ipcRenderer.on('handleEvent', (event, arg) => {
    domContentLoadedHandler(event, arg);
});
