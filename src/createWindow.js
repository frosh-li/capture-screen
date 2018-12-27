const { BrowserWindow, ipcMain } = electron = require('electron');
const path = require('path');
function createWindow() {
    const { width, height } = electron.screen.getPrimaryDisplay().bounds;
    console.log(width, height);
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
        modal: false,
        kiosk: true,
    })
    
    win.on('closed', () => {
        win = null
    })

    // 或加载本地HTML文件
    win.loadFile(path.join(__dirname,'assets/index.html'));
    win.webContents.on('did-finish-load', () => {
        win.webContents.send('startCapture'); // 窗口已经最小化
    })
    win.webContents.openDevTools();

    
    
    return win;
}

module.exports = createWindow;