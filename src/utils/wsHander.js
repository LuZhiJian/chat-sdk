import constant from './constant'
import store from '../store'
import { getAesString, getDAesString, stringToUint8Array, uint8ArrayToString } from './aes'
import db from '@/db'

const sendCase = (code, param) => {
  let obj = {
    seq: param.flag || new Date().getTime(),
    body: {}
  }
  const loginData = store.state.loginData || {}
  const loginUid = loginData.userInfo && loginData.userInfo.uid
  switch (code) {
    case 1000:
      obj.body = {
        sessionId: loginData.sessionId,
        plat: 3,
        version: constant.SDK_VERSION
      }
      break;
    case 1001:
      obj.body = {}
      break;
    case 1002:
      obj.body = {
        fromUid: param.fromUid || loginUid,
        toUid: param.toUid,
        msgType: param.type,
        content: param.content,
        flag: param.flag,
        time: param.time,
        uid: param.toUid
      }
      if (!param.fileId) {
        db.msgDB.add(obj.body)
      }
      break;

    default:
      break;
  }
  return obj
}

const receiveCase = (protorlId, res = {}) => {
  console.log(protorlId)
  switch (protorlId) {
    case 1000:
      console.log('websocket 登录成功!');
      break;
    case 1001:
      console.log('心跳回应!');
      break;
    case 1002:
      const msg = Object.assign({index: 'flag'}, res)
      console.log(msg)
      db.msgDB.update(msg)
      break;
    default:
      break;
  }
}

const Cat = {
  sendFun(code, data) {
    return new Promise(resolve => {
      const messageContent = sendCase(code, data)
      const dataString = JSON.stringify(messageContent)
      const dataBytes = stringToUint8Array(dataString)
      const sendMsg = getAesString(dataBytes, constant.API_KEY);
      const length = sendMsg.length
      const buf = new ArrayBuffer(8 + length) //定义一个6字节的内存区域
      const dv = new DataView(buf)
      dv.setInt8(0, 1, false)
      dv.setInt8(1, 0, false)
      dv.setUint16(2, code, false)
      dv.setUint32(4, length, false)
      for (let i = 0; i < length; i++) {
        dv.setUint8(i + 8, sendMsg[i])
      }
      resolve(buf)
    })
  },
  receiveFun(result) {
    return new Promise(resolve => {
      if (!result) { resolve(false); return false }
      const reader = new FileReader()
      reader.readAsArrayBuffer(result)
      reader.onload = (e) => {
        const buff = reader.result
        const dv = new DataView(buff)
        const protorlId = dv.getUint16(2) // 协议id
        const length = dv.getUint32(4)
        const msgContent = getDAesString(new Uint8Array(buff.slice(8)), constant.API_KEY)
        const res = JSON.parse(uint8ArrayToString(msgContent))
        if (+res.code === 200) {
          console.log(protorlId)
          receiveCase(protorlId, res.body)
          resolve(res.body)
        } else {
          console.log('sw响应错误')
        }
      }
    })
  }
}

export default Cat
