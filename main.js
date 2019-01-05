'use strict';
/** 
 * 类微信QQ截图工具
 * 
*/

const { app, globalShortcut, ipcMain } = require('electron');

const os = require('os');
const platform = os.platform();

const { createWindow, createExternalWindow } = require('./src/createWindow');

let win;
let ewin;

app.on('ready', () => {
    win = createWindow();
    if(!app.isPackaged){
        win && win.webContents.openDevTools();
    }
    globalShortcut.register('Esc', () => {
        app.quit();
    });

    // globalShortcut.register('Delete', () => {
    //     win.webContents.send('deleteShape');
    // });
    // globalShortcut.register('Backspace', () => {
    //     console.log('delete or backend');
    //     win.webContents.send('deleteShape');
    // });

    let displays = require('electron').screen.getAllDisplays();
    let externalDisplay = displays.find((display) => {
        return display.bounds.x !== 0 || display.bounds.y !== 0;
    });
    if (externalDisplay) {
        ewin = createExternalWindow();
        if(!app.isPackaged){
            ewin && ewin.webContents.openDevTools();
        }
    }

    ipcMain.on('fullscreen', (event, arg) => {
        if (arg.type === 'setfull') {
            console.log('set full screen', event);
            event.sender.send('handleEvent', arg);
        }
    });

    ipcMain.on('closeapp', () => {
        win.close();
        ewin && ewin.close();
        app.quit();
    });
    
});

app.on('window-all-closed', () => {
    app.quit();
});

app.on('activate', () => {
    if (win === null) {
        win = createWindow();
    }

    if (ewin === null) {
        ewin = createExternalWindow();
    }
});