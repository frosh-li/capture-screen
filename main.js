'use strict';
/** 
 * 类微信QQ截图工具
 * 
*/

const { app, globalShortcut, ipcMain } = require('electron');

const createWindow = require('./src/createWindow');

let win;

app.on('ready', () => {
    

    win = createWindow();
    globalShortcut.register('Esc', () => {
        app.quit();
    });

    ipcMain.on('fullscreen', (event, arg) => {
        if (arg.type === 'setfull') {
            console.log('set full screen');
            win.show();
        }

        if (arg.type === 'setmin') {
            win.minimize();
        }
    });
    
});

app.on('window-all-closed', () => {
    app.quit();
});

app.on('activate', () => {
    if (win === null) {
        win = createWindow();
    }
})