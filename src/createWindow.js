const electron = require('electron');
const { BrowserWindow } = electron;
const os = require('os');
const platform = os.platform();
const path = require('path');
function createWindow() {
    const { width, height } = electron.screen.getPrimaryDisplay().bounds;
    let win = new BrowserWindow({
        width: width,
        height: height,
        frame: false,
        transparent: false,
        alwaysOnTop: true,
        show: false,
        fullscreen: false,
        resizable: false,
        maximize: false,
        maximizable: false,
        enableLargerThanScreen: true,
        minimizable: false,
        modal: platform !== 'win32' ? false : true,
        kiosk: platform === 'win32' ? false : true,
    });

    win.on('closed', () => {
        win = null;
    });

    // 或加载本地HTML文件
    win.loadFile(path.join(__dirname, 'assets/index.html'));
    win.webContents.on('did-finish-load', () => {
        win.webContents.send('startCapture'); // 窗口已经最小化
    });

    return win;
}

module.exports = createWindow;
