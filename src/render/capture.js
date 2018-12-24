// In the renderer process.
const {
    desktopCapturer,
    remote,
    screen,
    ipcRenderer,
} = require('electron')
const fs = require('fs');
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
                    maxHeight: 8000
                }
            }
        }).then((stream) => handleStream(stream))
        .catch((e) => handleError(e))
})

function handleStream(stream) {
    const video = document.createElement('video');
    video.srcObject = stream;
    let hasShot = false;
    video.onloadedmetadata = (e) => {
        if (hasShot) {
            return;
        }
        hasShot = true;
        video.play();
        setTimeout(() => {
            video.pause();
            let canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            console.log(video.videoHeight, video.videoWidth);
            let ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            let imageData = canvas.toDataURL('image/png', 1);
            
            document.body.style.backgroundImage = `url(${imageData})`;

            fs.writeFileSync('./screenshot.png', imageData);
            video.remove();
            ipcRenderer.sendSync('fullscreen', {
                type: 'setfull',
                width: canvas.width,
                height: canvas.height,
            }); // 通知最大化窗口
        },200);
    }

    document.body.appendChild(video);
}

function handleError(e) {
    console.log(e)
}