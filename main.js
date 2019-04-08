'use strict';
/** 
 * 类微信QQ截图工具
 * 
*/

const { app, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const platform = os.platform();

const { createWindow, createExternalWindow } = require('./src/createWindow');

let win;
let ewin;
let displayCounts = 0;
console.log(os.tmpdir());

function unRegisterShortcut() {
    globalShortcut.unregister('Esc');
    globalShortcut.unregister('Delete');
}

app.on('ready', () => {
    win = createWindow();
    

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
            win.setFullScreen(true);
            ewin && ewin.show() && ewin.setFullScreen(true);
            // win.webContents.openDevTools();
            // ewin && ewin.webContents.openDevTools();
        }
        if (arg.type === 'setfull') {
            event.sender.send('handleEvent', arg);
        }
    });

    ipcMain.on('closeapp', () => {
        displayCounts = 0;
        unRegisterShortcut();
        win.reload();
        win.hide();
        ewin && ewin.reload() && ewin.hide();
    });

    globalShortcut.register('Ctrl+Alt+A', () => {
        console.log('start to cap');
        win.webContents.send('startCapture');
        ewin && ewin.webContents.send('startCapture');

        globalShortcut.register('Esc', () => {
            displayCounts = 0;
            unRegisterShortcut();
            win.reload();
            win.hide();
            ewin && ewin.reload() && ewin.hide();
        });
    
        globalShortcut.register('Delete', () => {
            win.webContents.send('deleteShape');
        });
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
