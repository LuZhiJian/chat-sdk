import { ipcRenderer } from 'electron'
/**
 * 创建窗口
 */
export function windowCreate(args) {
  console.log(args)
  ipcRenderer.send('window-new', args)
}

/**
 * 关闭窗口
 */
export function windowClose(id) {
  console.log('窗口id：' + id)
  ipcRenderer.send('window-closed', id)
}

/**
 * 隐藏窗口
 */
export function windowHide(id) {
  console.log('窗口id：' + id)
  ipcRenderer.send('window-hide', id)
}

/**
 * 显示窗口
 */
export function windowShow(id) {
  console.log('窗口id：' + id)
  ipcRenderer.send('window-show', id)
}

/**
 * 更新收到消息数量
 */
export function updateBadge(num) {
  ipcRenderer.sendSync('update-badge', num)
  ipcRenderer.send('update-all-badge', num)
}
