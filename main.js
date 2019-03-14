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
let displayCounts = 0;

app.on('ready', () => {
    win = createWindow();
    globalShortcut.register('Esc', () => {
        app.quit();
    });

    globalShortcut.register('Delete', () => {
        win.webContents.send('deleteShape');
    });

    // globalShortcut.register('Backspace', () => {
    //     win.webContents.send('deleteShape');
    // });

    let displays = require('electron').screen.getAllDisplays();
    let externalDisplay = displays.find(display => {
        return display.bounds.x !== 0 || display.bounds.y !== 0;
    });
    if (externalDisplay) {
        ewin = createExternalWindow();
    }

    ipcMain.on('fullscreen', (event, arg) => {
        displayCounts++;
        if(displayCounts === displays.length) {
            win.show();
            ewin && ewin.show();
        }
        if (arg.type === 'setfull') {
            event.sender.send('handleEvent', arg);
        }
    });

    ipcMain.on('closeapp', () => {
        displayCounts = 0;
        win.hide();
        ewin && ewin.hide();
        win = createWindow();
        if (externalDisplay) {
            ewin = createExternalWindow();
        }
        // app.quit();
    });

    globalShortcut.register('Ctrl+Alt+A', () => {
        win.webContents.send('startCapture');
        ewin && ewin.webContents.send('startCapture');
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
