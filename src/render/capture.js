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
console.log('curDisplay', curDisplay);
const fs = require('fs');
const path = require('path');
const scaleFactor = curDisplay.scaleFactor;


function startCapture() {
    let allDisplay = require('electron').screen.getAllDisplays();
    console.log(allDisplay);
    allDisplay.forEach((dis, i) => {
        if (dis.id == curDisplay.id) {
            displayIndex = i;
        }
    });
    desktopCapturer.getSources(
        {
            types: ['screen'],
            thumbnailSize: {
                width: Math.floor(curDisplay.size.width * scaleFactor),
                height: Math.floor(curDisplay.size.height * scaleFactor),
            }
        },
        (error, sources) => {
            if (error) throw error;
            console.log('capturer source', sources);
            // sources.forEach(source => {
            //     fs.writeFile(path.join(os.tmpdir(), source.name+'.png'), source.thumbnail.toPNG(), function(err) {
            //         if(err){
            //             console.log(err);
            //         }
            //     });
            // });
            let curSource = sources[displayIndex];
            fs.writeFileSync(path.join(os.tmpdir(), curDisplay.id+'.png'), curSource.thumbnail.toPNG());
            let thumbnail = sources[displayIndex].thumbnail.toDataURL();
            //setTimeout(() => {
            document.body.style.backgroundImage = `url(${thumbnail})`;
            ipcRenderer.send('fullscreen', {
                type: 'setfull',
                width: curDisplay.size.width * scaleFactor,
                height: curDisplay.size.height * scaleFactor,
                win: curWindow,
            }); // 通知最大化窗口
            //});
            // navigator.mediaDevices
            //     .getUserMedia({
            //         audio: false,
            //         video: {
            //             mandatory: {
            //                 chromeMediaSource: 'desktop',
            //                 chromeMediaSourceId: curSource.id,
            //                 minWidth: 1280,
            //                 maxWidth: 8000,
            //                 minHeight: 720,
            //                 maxHeight: 8000,
            //             },
            //         },
            //     })
            //     .then(stream => handleStream(stream))
            //     .catch(e => handleError(e));
        },
    );
}

function handleStream(stream) {
    const video = document.createElement('video');
    
    video.addEventListener('play', () => {
        let canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        let ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        let imageData = canvas.toDataURL('image/png', 1);
        document.body.style.backgroundImage = `url(${imageData})`;
        // document.body.removeChild(video);
        // clipboard.writeImage(
        //     nativeImage.createFromDataURL(imageData),
        //     curDisplay.id,
        // );
        let base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        let dataBuffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(path.join(os.tmpdir(), curDisplay.id+'.png'), dataBuffer);
        video.pause();
        document.body.removeChild(video);
        ipcRenderer.send('fullscreen', {
            type: 'setfull',
            width: canvas.width,
            height: canvas.height,
            win: curWindow,
        }); // 通知最大化窗口
    });
    video.addEventListener('canplay', function() {
        video.play();
    });
    video.srcObject = stream;
    document.body.appendChild(video);
}

function handleError() {
    console.log('屏幕捕捉失败');
}

ipcRenderer.on('startCapture', () => {
    startCapture();
});
ipcRenderer.on('handleEvent', (event, arg) => {
    domContentLoadedHandler(event, arg);
});


// window.addEventListener('keypress', (e) => {
//     console.log(e);
//     return true;
// }, true);