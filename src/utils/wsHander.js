import constant from './constant'
import store from '../store'
import { getAesString, getDAesString, stringToUint8Array, uint8ArrayToString } from './aes'
import { deepClone } from './common'
import md5 from 'js-md5'
import db from '@/db'

const getAesKey = (loginId, uid) => {
  return md5(`${loginId}_${uid}`)
}

const getDaesKey = (loginId, uid) => {
  return md5(`${uid}_${loginId}`)
}

const setContent = (content, key) => {
  const dataBytes = stringToUint8Array(JSON.stringify(content))
  const asContent = getAesString(dataBytes, key)
  return asContent
}

const getContent = (content, key) => {
  const dataBytes = getDAesString(content, key)
  const dsContent = JSON.parse(uint8ArrayToString(new Uint8Array(dataBytes)))
  return dsContent
}


const sendCase = (code, param) => {
  let obj = {
    seq: param.flag || new Date().getTime(),
    body: {}
  }
  const loginData = store.state.loginData || {}
  const loginUid = loginData.userInfo && loginData.userInfo.uid
  const key = param.toUid ? getAesKey(loginUid, param.toUid) : ''
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
      const contentPak = {
        fromUid: param.fromUid || loginUid,
        toUid: param.toUid,
        msgType: param.type,
        content: param.content,
        flag: param.flag,
        time: param.time,
        uid: param.toUid
      }
      const sendPak = deepClone(contentPak)
      sendPak.content = setContent(param.content, key)
      obj.body = sendPak
      if (!param.fileId) {
        db.msgDB.add(contentPak)
      }
      break;

    default:
      break;
  }
  return obj
}

const receiveCase = (protorlId, res = {}) => {
  console.log(protorlId)
  const loginData = store.state.loginData || {}
  const loginUid = loginData.userInfo && loginData.userInfo.uid
  const key = res.fromUid ? getDaesKey(loginUid, res.fromUid) : ''
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
    case 2000:
      const oneMsg = deepClone(res)
      oneMsg.content = getContent(oneMsg.content, key)
      db.msgDB.add(msg)
      break;
    default:
      break;
  }
}

const Cat = {
  sendFun(code, data) {
    return new Promise(resolve => {
      const messageContent = sendCase(code, data)
      console.log(messageContent)
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
