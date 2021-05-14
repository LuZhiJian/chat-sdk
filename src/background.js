'use strict'

import { app, protocol, BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { Window } from './window'
const isDevelopment = process.env.NODE_ENV !== 'production'

let window = null
const appName = isDevelopment ? 'peanutTest' : 'peanut'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: appName, privileges: { secure: true, standard: true } }
])

async function createWindow() {
  window = new Window()
  window.listen()
  window.createWindows({isMainWin: true})
  window.createTray()
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit',()=>{
  window.isClose = true
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  // 限制只可以打开一个应用, 4.x的文档
  const gotTheLock = app.requestSingleInstanceLock()
  if (!gotTheLock) {
    app.exit()
  } else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      if (window.main) {
        // if (window.win.isMinimized()){
        //   newWindow.win.restore()
        // }
        window.main.focus()
        window.main.show()
      }
    })
  }
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  } else {
    window.main.show()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors')
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      protocol.registerFileProtocol('file', (request, callback) => {
      const pathname = decodeURI(request.url.replace('file:///', ''));
      // const pathname = decodeURIComponent(request.url.replace('file:///', ''));
      callback(pathname);
    })
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
