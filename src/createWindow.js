const { BrowserWindow } = require('electron')
function createWindow() {
    let win = new BrowserWindow({ 
        width: 1000, 
        height: 1000, 
        frame: false, 
        transparent: true,
        minimizable: false,
        alwaysOnTop: true,
        show: false,
        resizable: false,
        fullscreen: true,
    })
    //win.setAlwaysOnTop(true);
    
    win.on('closed', () => {
        win = null
    })

    // 或加载本地HTML文件
    win.loadURL(`file://${__dirname}/assets/index.html`);
    
    // win.webContents.openDevTools();
    return win;
}

module.exports = createWindow;