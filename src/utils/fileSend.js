import store from '../store'
import db from '@/db'
import { goBottom } from './common'
import websocket from './websocket'
const loginData = store.state.loginData || {}

const fileFix = {
  loginUid: loginData.userInfo && loginData.userInfo.uid,
  async ready(param) {
    const msg = Object.assign(param, {
      fromUid: this.loginUid,
      msgType: param.fileType
    })
    await db.msgDB.add(msg)
    goBottom()
  },
  progress(param) {
    const msg = Object.assign(param, {
      fromUid: this.loginUid,
      msgType: param.fileType,
      index: 'flag'
    })
    // console.log(msg)
    db.msgDB.update(msg)
  },
  error(param) {
    const msg = Object.assign(param, {
      fromUid: this.loginUid,
      msgType: param.fileType,
      index: 'flag'
    })
    db.msgDB.delete(msg)
  },
  cancel(param) {
    const msg = Object.assign(param, {
      fromUid: this.loginUid,
      index: 'flag'
    })
    db.msgDB.delete(msg)
  },
  finish(param) {
    const msg = Object.assign(param, {
      fromUid: this.loginUid,
      msgType: param.fileType
    })
    const sendData = {
      fromUid: msg.fromUid,
      toUid: msg.toUid,
      msgType: msg.msgType,
      content: msg.content,
      flag: msg.flag,
      time: msg.flag,
      fileId: msg.fileId,
      url: msg.url
    }
    db.msgDB.update({...sendData, ...{index: 'flag', state: 1}})
    websocket.send(2, sendData)
  }
}

export default fileFix
