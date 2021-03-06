const electron = require('electron');
const { BrowserWindow } = electron;
const os = require('os');
const platform = os.platform();
const path = require('path');
function createWindow() {
    const bounds = electron.screen.getPrimaryDisplay().bounds;

    let win = new BrowserWindow({
        // ...bounds,
        width: bounds.width,
        height: bounds.height,
        frame: false,
        transparent: false,
        alwaysOnTop: true,
        show: false,
        fullscreen: false,
        resizable: false,
        maximize: true,
        maximizable: true,
        modal: true,
    });

    win.on('closed', () => {
        win = null;
    });


    // 或加载本地HTML文件
    win.loadFile(path.join(__dirname, 'assets/index.html'));
    // win.webContents.openDevTools();
    

    return win;
}

function createExternalWindow() {
    // 在外部显示器中创建一个窗口
    let displays = electron.screen.getAllDisplays();
    let externalDisplay = displays.find(display => {
        return display.bounds.x !== 0 || display.bounds.y !== 0;
    });

    if (externalDisplay) {
        let ewin = new BrowserWindow({
            x: externalDisplay.bounds.x,
            y: externalDisplay.bounds.y,
            width: externalDisplay.bounds.width,
            height: externalDisplay.bounds.height,
            frame: false,
            transparent: false,
            alwaysOnTop: true,
            show: false,
            fullscreen: false,
            resizable: false,
            maximize: true,
            maximizable: true,
            modal: true,
        });

        ewin.loadFile(path.join(__dirname, 'assets/index.html'));
        ewin.on('closed', () => {
            ewin = null;
        });
        ewin.webContents.on('did-finish-load', () => {
            //ewin.webContents.send('startCapture'); // 窗口已经最小化
        });
        return ewin;
    }
}

module.exports = {
    createWindow: createWindow,
    createExternalWindow: createExternalWindow,
};
