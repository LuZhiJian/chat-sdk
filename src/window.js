import { app, BrowserWindow, ipcMain, Menu, MenuItem, Tray, nativeImage, screen } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import path from 'path'
import Badge from 'electron-windows-badge'

const isWindows = process.platform === 'win32' ? true : false; //系统判断
const isDevelopment = process.env.NODE_ENV !== 'production'
const appName = isDevelopment ? 'peanutTest' : 'peanut'
const logoPath = path.join(__dirname, '../static/logo.png')
const emptyPath = path.join(__dirname, '../static/empty.ico')

export const windowsCfg = {
  id: '', //唯一id
  title: '', //窗口标题
  width: '', //宽度
  height: '', //高度
  minWidth: '', //最小宽度
  minHeight: '', //最小高度
  route: '', // 页面路由URL '/manage'
  resizable: true, //是否支持调整窗口大小
  maximize: false, //是否最大化
  minimize: false, //是否最小化
  icon: isWindows ? path.join(__dirname, '../static/logo.png') : '',
  backgroundColor: '#eee', //窗口背景色
  data: null, //数据
  isMultiWindow: false, //是否支持多开窗口 (如果为false，当窗体存在，再次创建不会新建一个窗体 只focus显示即可，，如果为true，即使窗体存在，也可以新建一个)
  isMainWin: false, //是否主窗口(当为true时会替代当前主窗口)
  parentId: '', //父窗口id  创建父子窗口 -- 子窗口永远显示在父窗口顶部 【父窗口可以操作】
  modal: false, //模态窗口 -- 模态窗口是禁用父窗口的子窗口，创建模态窗口必须设置 parent 和 modal 选项 【父窗口不能操作】
}

/**
 * 窗口配置
 */
export class Window {
  constructor() {
    this.main = null; //当前页
    this.homeWin = null;
    this.group = {}; //窗口组
    this.tray = null; //托盘
    this.isClose = false; //控制关闭程序
  }

  // 窗口配置
  winOpts(wh = []) {
    return {
      width: wh[0],
      height: wh[1],
      backgroundColor: '#fff',
      autoHideMenuBar: true,
      // titleBarStyle: "hidden",
      resizable: true,
      minimizable: true,
      maximizable: true,
      frame: false,
      show: false,
      transparent: true,
      webPreferences: {
        contextIsolation: false, //上下文隔离
        nodeIntegration: true, //启用Node集成（是否完整的支持 node）
        // nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
        devTools: true,
        webSecurity: false,
        enableRemoteModule: true, //是否启用远程模块（即在渲染进程页面使用remote）
      }
    }
  }

  // 获取窗口
  getWindow(id) {
    return BrowserWindow.fromId(id)
  }

  // 获取全部窗口
  getAllWindows() {
    return BrowserWindow.getAllWindows()
  }

  setWinPosition(data, win) {
    let x = screen.getCursorScreenPoint().x, //鼠标xy值
        y = screen.getCursorScreenPoint().y,
        Vw = screen.getPrimaryDisplay().workAreaSize.width, //屏幕尺寸
        Vh = screen.getPrimaryDisplay().workAreaSize.height,
        Cw = data.width, //卡片尺寸
        Ch = data.height

    win.setBounds({
      x: x + Cw >= Vw ? x - Cw : x,
      y: y + Ch >= Vh ? y - Ch : y
    })
    win.on("blur", () => {
      win.hide()
    })
  }

  // 创建窗口
  createWindows(params) {

    const options = params.winInfo || params
    // console.log('------------开始创建窗口...')
    // console.log(options)

    let args = Object.assign({}, windowsCfg, options)
    // console.log(args)
    // 判断窗口是否存在
    for (let i in this.group) {
      if (this.getWindow(Number(i)) && this.group[i].route === args.route && !this.group[i].isMultiWindow) {
        this.getWindow(Number(i)).webContents.send(params.win, params.data)
        if (params.position) {
          this.setWinPosition(options, this.getWindow(Number(i)))
        }
        if (params.isMainWin || (params.data && JSON.stringify(params.data) !== "{}")) {
          setTimeout(() => {
            this.getWindow(Number(i)).show()
            this.getWindow(Number(i)).focus()
          }, 100)
        }
        return
      }
    }

    let opt = this.winOpts([args.width || 800, args.height || 540])
    if (args.parentId) {
      console.log('parentId：' + args.parentId)
      opt.parent = this.getWindow(args.parentId)
    } else if (this.main) {
      // console.log(666)
    }
    if (typeof args.devTools === 'boolean') opt.webPreferences.devTools = args.devTools
    if (typeof args.modal === 'boolean') opt.modal = args.modal
    if (typeof args.resizable === 'boolean') opt.resizable = args.resizable
    if (args.backgroundColor) opt.backgroundColor = args.backgroundColor
    if (args.minWidth) opt.minWidth = args.minWidth
    if (args.minHeight) opt.minHeight = args.minHeight
    if (args.maxWidth) opt.maxWidth = args.maxWidth
    if (args.maxHeight) opt.maxHeight = args.maxHeight
    if (args.isMainWin) opt.titleBarStyle = 'hidden'
    let win = new BrowserWindow(opt)
    // console.log('窗口id：' + win.id)
    this.group[win.id] = {
      route: args.route,
      isMultiWindow: args.isMultiWindow,
    }
    // 是否最大化
    if (args.maximize && args.resizable) {
      win.maximize()
    }
    // 是否主窗口
    if (args.isMainWin) {
      if (this.main) {
        // console.log('主窗口存在')
        delete this.group[this.main.id]
        this.main.close()
      }
      this.main = win
      const badgeOptions = {
        fontColor: '#fff',
        color: '#f00', // 背景颜色
        fit: true,
        decimals: 0,
        radius: 8
      }
      this.homeWin = win
      new Badge(win, badgeOptions);
    }
    args.id = win.id
    win.on('close', (e) => {
      win.hide()
      if(this.isClose) return
      e.preventDefault()
    })

    // 打开网址（加载页面）
    /**
     * 开发环境: http://localhost:3000
     * 正式环境: app://./index.html
     */
    let winURL
    if (process.env.WEBPACK_DEV_SERVER_URL) {
      // Load the url of the dev server if in development mode
      // win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
      winURL = args.route ? `http://localhost:3000${args.route}` : `http://localhost:3000`
      // 打开开发者调试工具
      // if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
      createProtocol(appName)
      // Load the index.html when not in development
      // win.loadURL('peanut://./index.html')
      winURL = args.route ? `${appName}://./index.html${args.route}` : `${appName}://./index.html`
    }
    win.loadURL(winURL)
    win.webContents.openDevTools({mode:'detach'})
    win.once('ready-to-show', () => {
      if (params.isMainWin || (params.data && JSON.stringify(params.data) !== "{}")) {
        win.show()
        if (params.win) {
          if (params.position) {
            this.setWinPosition(params.winInfo, win)
          }
          setTimeout(() => {
            win.webContents.send(params.win, params.data)
          }, 300)
        }
      }
    })

    // 屏蔽窗口菜单（-webkit-app-region: drag）
    // win.hookWindowMessage(278, function (e) {
    //   win.setEnabled(false)
    //   setTimeout(() => {
    //     win.setEnabled(true)
    //   }, 100)

    //   return true
    // })
  }

  // 关闭所有窗口
  closeAllWindow() {
    for (let i in this.group) {
      if (this.group[i]) {
        if (this.getWindow(Number(i))) {
          this.getWindow(Number(i)).close()
        } else {
          this.isClose = true
          app.quit()
          app.exit()
        }
      }
    }
  }

  // 创建托盘
  createTray() {
    const contextMenu = Menu.buildFromTemplate([{
      label: '显示',
      click: () => {
        for (let i in this.group) {
          if (this.group[i]) {
            // this.getWindow(Number(i)).show()
            let win = this.getWindow(Number(i))
            if (!win) return
            if (win.isMinimized()) win.restore()
            win.show()
          }
        }
      }
    }, {
      label: '退出',
      click: () => {
        this.isClose = true
        app.quit()
        app.exit() //因为程序设定关闭为最小化，所以调用两次关闭，防止最大化时一次不能关闭的情况
      }
    }])
    if (process.platform === 'darwin') {
      const trayIcon = path.join(__dirname, '../static/tray-logo.png')
      const image = nativeImage.createFromPath(trayIcon)
      image.setTemplateImage(true)
      this.tray = new Tray(image)
    } else {
      const trayIcon = path.join(__dirname, '../static/logo.ico')
      this.tray = new Tray(trayIcon)
      const MsgWH = {
        width: 222,
        height: 115
      } //新消息窗口尺寸 belong to windows
      //应用任务栏图标闪烁
      let count = 0,
          timer = null,
          winBounds;
      winBounds = this.tray.getBounds()

      let param = { // belong to windows
        winInfo: {
          //右下角信息提示
          title: '',
          route: '#/window/msg',
          width: 240,
          height: 110,
          x: winBounds.x + winBounds.width / 2 - MsgWH.width / 2,
          y: winBounds.y - MsgWH.height,
          show: false,
          frame: false, //无边框窗口
          skipTaskbar: true,
          resizable: false,
          movable: false,
          parent: this.homeWin,
          devTools: false
        },
        win: 'msg-data',
        data: Object.assign({}, data)
      }
      this.createWindows(param)

      ipcMain.on("icon-Twinkle", (event, arg) => {
        count = 0;
        clearInterval(timer);
        this.tray.setImage(logoPath);
        newWindow.msgWindow.webContents.closeDevTools()
        newWindow.msgWindow.webContents ? newWindow.msgWindow.webContents.send("set-data", arg) :''
        //调整显示高度
        let msgHeight = 70 + 45 * arg.newMsgList.length
        newWindow.msgWindow.setBounds({
          height: msgHeight,
          y: winBounds.y - msgHeight
        })

        timer = setInterval(function () {
          count++;
          const icoPath = count % 2 === 0 ? emptyPath : logoPath
          this.tray.setImage(icoPath);
          let mouse = screen.getCursorScreenPoint(), //鼠标位置
            WinBounds = this.tray.getBounds(), //托盘图标位置
            MsgBounds = newWindow.msgWindow.getBounds();
          if (
            mouse.x >= WinBounds.x &&
            mouse.x <= WinBounds.x + WinBounds.width &&
            mouse.y >= WinBounds.y &&
            mouse.y <= WinBounds.y + WinBounds.height
          ) {
            newWindow.msgWindow.show();
          } else {
            if (
              newWindow.msgWindow.isVisible() &&
              mouse.x >= MsgBounds.x &&
              mouse.x <= MsgBounds.x + MsgBounds.width &&
              mouse.y >= MsgBounds.y &&
              mouse.y <= MsgBounds.y + MsgBounds.height
            ) {
              newWindow.msgWindow.show()
            } else {
              newWindow.msgWindow.hide()
            }
          }
        }, 500)
        newWindow[arg.winName].flashFrame(true); //任务栏提示
        newWindow.win.webContents ? newWindow.win.webContents.send('audio-play'):'' //提示音
      });

      // 取消闪烁
      ipcMain.on("icon-Twinkle-cancle", (event, arg) => {
        count = 0;
        this.main.flashFrame(false);
        clearInterval(timer);
        this.tray.setImage(logoPath);
      });

      // 显示消息
      ipcMain.on("msgWindow", (event, arg) => {
        if (arg.SH) {
          this.main.show()
          this.main.webContents ? this.main.webContents.send("newMsgList-dataChange", {
            listNum: arg.listNum,
            uId: arg.uId
          }) : ''
          if (arg.listNum === 0) {
            count = 0;
            clearInterval(timer)
            this.tray.setImage(logoPath)
          }
        } else {
          count = 0
          clearInterval(timer)
          this.tray.setImage(logoPath)
        }
        newWindow.msgWindow.hide()
        this.main.flashFrame(false)
      });
    }
    this.tray.setContextMenu(contextMenu)
    this.tray.setToolTip('花生聊天')

    this.tray.on('click',() => {
      for (let i in this.group) {
        if (this.group[i]) {
          let win = this.getWindow(Number(i))
          if (!win) return
          if (win.isMinimized()) win.restore()
          if (win.id === 1) win.show()
        }
      }
    })
  }

  setBadge(num) {
    const numStr = num ? num.toString() : ''
    this.tray.setTitle(numStr)
    app.dock.setBadge(numStr)
  }

  // 开启监听
  listen() {
    // 关闭
    ipcMain.on('window-closed', (event, winId) => {
      if (winId) {
        this.getWindow(Number(winId)).close()
        if (this.group[Number(winId)]) delete this.group[Number(winId)]
      } else {
        this.closeAllWindow()
      }
    })

    // 隐藏
    ipcMain.on('window-hide', (event, winId) => {
      if (winId) {
        this.getWindow(Number(winId)).hide()
      } else {
        for (let i in this.group)
          if (this.group[i]) this.getWindow(Number(i)).hide()
      }
    })

    // 显示
    ipcMain.on('window-show', (event, winId) => {
      if (winId) {
        this.getWindow(Number(winId)).show()
      } else {
        for (let i in this.group)
          if (this.group[i]) this.getWindow(Number(i)).show()
      }
    })

    // 最小化
    ipcMain.on('window-mini', (event, winId) => {
      if (winId) {
        this.getWindow(Number(winId)).minimize()
      } else {
        for (let i in this.group)
          if (this.group[i]) this.getWindow(Number(i)).minimize()
      }
    })

    // 最大化
    ipcMain.on('window-max', (event, winId) => {
      if (winId) {
        this.getWindow(Number(winId)).maximize()
      } else {
        for (let i in this.group)
          if (this.group[i]) this.getWindow(Number(i)).maximize()
      }
    })

    // 最大化/最小化
    ipcMain.on('window-max-min-size', (event, winId) => {
      if (winId) {
        if (this.getWindow(winId).isMaximized()) {
          this.getWindow(winId).unmaximize()
        } else {
          this.getWindow(winId).maximize()
        }
      }
    })

    // 还原
    ipcMain.on('window-restore', (event, winId) => {
      if (winId) {
        this.getWindow(Number(winId)).restore()
      } else {
        for (let i in this.group)
          if (this.group[i]) this.getWindow(Number(i)).restore()
      }
    })

    // 重新加载
    ipcMain.on('window-reload', (event, winId) => {
      if (winId) {
        this.getWindow(Number(winId)).reload()
      } else {
        for (let i in this.group)
          if (this.group[i]) this.getWindow(Number(i)).reload()
      }
    })

    // 更新信息数量标签
    ipcMain.on('update-all-badge', (event, args) => {
      this.setBadge(args)
    })

    // 创建窗口
    ipcMain.on('window-new', (event, args) => {
      this.createWindows(args)
    })

    // 卡片聊天按钮
    ipcMain.on('chat-to-chat', (event, args) => {
      this.main.webContents.send('chat-to-chat', args)
    })

    //右键列表
    ipcMain.on("right-click-menu", (event, arg) => {
      let menu = new Menu()
      // console.log(arg)
      if (arg.type === 'msg') {
        if ([1].includes(arg.item.msgType)) {
          menu.append(new MenuItem({
            label: '复制',
            click: () => {
              this.main.webContents.send('msg-copy', arg)
            }
          }))
        }
        if (arg.ddTime < 2 && arg.item.fromUid === arg.loginId) {
          menu.append(new MenuItem({
            label: '撤回',
            click: () => {
              this.main.webContents.send('msg-recall', arg)
            }
          }))
        }
        menu.append(new MenuItem({
          label: '删除',
          click: () => {
            this.main.webContents.send('msg-del', arg)
          }
        }))
        if ([2,3,4,6,7].includes(arg.item.msgType)) {
          menu.append(new MenuItem({
            label: '在文件夹中显示',
            click: () => {
              this.main.webContents.send('msg-show-folder', arg)
            }
          }))
        }
      } else if (arg.type === 'chat-user') {
        menu.append(new MenuItem({
          label: '删除',
          click: () => {
            this.main.webContents.send('chat-user-del', arg)
          }
        }))
      } else if (arg.type === 'new-user') {
        menu.append(new MenuItem({
          label: '删除',
          click: () => {
            this.main.webContents.send('new-user-del', arg)
          }
        }))
      } else if (arg.type === 'editor') {
        menu.append(new MenuItem({
          label: '剪切',
          enabled: arg.item.myTxt ? true : false,
          click: () => {
            this.main.webContents.send('editor-cut', arg.item)
          }
        }))
        menu.append(new MenuItem({
          label: '复制',
          enabled: arg.item.myTxt ? true : false,
          click: () => {
            this.main.webContents.send('editor-copy', arg.item)
          }
        }))
        menu.append(new MenuItem({
          label: '粘贴',
          enabled: arg.item.clipboardContent ? true : false,
          click: () => {
            this.main.webContents.send('editor-paste', arg)
          }
        }))
         menu.append(new MenuItem({
          label: '删除',
          enabled: arg.item.myTxt ? true : false,
          click: () => {
            this.main.webContents.send('editor-delete', arg)
          }
        }))
      }
      menu.popup(this.main)
    })
  }
}
