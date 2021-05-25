import constant from './constant'
import store from '../store'
import { getAesString, getDAesString, stringToUint8Array, uint8ArrayToString } from './aes'
import { deepClone } from './common'
import md5 from 'js-md5'
import api from './api'
import db from '@/db'
import websocket from './websocket'

const getAesKey = (loginId, uid) => {
  console.log(`${loginId}_${uid}`)
  return md5(`${loginId}_${uid}`).substring(0, 16)
}

const getDaesKey = (fromUid, toUid) => {
  console.log(`${fromUid}_${toUid}`)
  return md5(`${fromUid}_${toUid}`).substring(0, 16)
}

const uint8arrayToBase64 = (u8Arr) => {
  let CHUNK_SIZE = 0x8000; //arbitrary number
  let index = 0;
  let length = u8Arr.length;
  let result = '';
  let slice;
  while (index < length) {
    slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length));
    result += String.fromCharCode.apply(null, slice);
    index += CHUNK_SIZE;
  }
  // web image base64图片格式: "data:image/png;base64," + b64encoded;
  // return  "data:image/png;base64," + btoa(result);
  return btoa(result);
}

const base64ToUint8Array = (base64String) => {
  let padding = '='.repeat((4 - base64String.length % 4) % 4);
  let base64 = (base64String + padding)
  .replace(/\-/g, '+')
  .replace(/_/g, '/');

  let rawData = window.atob(base64);
  let outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const setContent = (content, key) => {
  const dataBytes = stringToUint8Array(JSON.stringify(content))
  const asContent = getAesString(dataBytes, key)
  return uint8arrayToBase64(asContent)
}

const getContent = (content, key) => {
  const u8arrayContent = base64ToUint8Array(content)
  const dataBytes = getDAesString(u8arrayContent, key)
  const dsContent = JSON.parse(uint8ArrayToString(new Uint8Array(dataBytes)))
  return dsContent
}

const sayUser = async (id) => {
  const chatList = await db.userDB.chatUsers.getChattingList()
  const find = chatList.find(o => o.uid === id)
  if (find) {
    return true
  } else {
    const user = await db.userDB.contacts.getContactDetail(id) || await api.contactDetail({ param: { targetUid: id } })
    await db.userDB.chatUsers.addChatUser(user)
    store.dispatch('setChatUser', user)
  }
}

const sendCase = (code, param) => {
  let obj = {
    seq: param.flag || new Date().getTime(),
    body: {}
  }
  const loginData = store.state.loginData || {}
  const loginUid = loginData.userInfo && loginData.userInfo.uid
  const key = param.toUid ? getAesKey(loginUid, param.toUid) : ''
  console.log(key)
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
        uid: param.toUid,
        state: 1
      }
      const sendPak = deepClone(contentPak)
      sendPak.content = setContent(param.content, key)
      obj.body = sendPak
      if (!param.fileId) {
        db.msgDB.add(contentPak)
      }
      break;
    case 1003:
      obj.body = param
      if (param.msgStatus === 2) {
        const receipt = {index: 'msgId', read: true, msgId: param.msgId, friendId: param.targetUid}
        db.msgDB.update(receipt)
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
  const friendId = loginUid === res.fromUid ? res.toUid : res.fromUid
  const key = friendId ? getDaesKey(res.fromUid, res.toUid) : ''
  console.log(key)
  switch (protorlId) {
    case 1000:
      console.log('websocket 登录成功!');
      break;
    case 1001:
      console.log('心跳回应!');
      break;
    case 1002:
      const msg = Object.assign({index: 'flag', state: 2}, res)
      db.msgDB.update(msg)
      break;
    case 1003:
      break;
    case 2000:
      const oneMsg = deepClone(res)
      oneMsg.content = getContent(oneMsg.content, key)
      oneMsg.time = oneMsg.sendTime
      oneMsg.uid = friendId
      if (oneMsg.fromUid !== loginUid) {
        oneMsg.read = false
      }
      sayUser(friendId)
      console.log(oneMsg)
      const receiptdata = {
        msgId: oneMsg.msgId,
        targetUid: oneMsg.fromUid,
        msgStatus: 1
      }
      websocket.send(3, receiptdata)
      db.msgDB.add(oneMsg)
      break;
    case 2002:
      const receiptMsg = deepClone(res)
      let status = null
      switch (receiptMsg.msgStatus) {
        case 1:
          status = 3
          break;
        case 2:
        case 3:
          status = 4
          break;

        default:
          break;
      }
      if (status) {
        const receipt = {index: 'msgId', msgId: receiptMsg.msgId, friendId: receiptMsg.targetUid, state: status}
        db.msgDB.update(receipt)
      }
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
      const sendMsg = getAesString(dataBytes, constant.API_KEY)
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
          resolve(res)
        } else {
          console.log('sw响应错误')
        }
      }
    })
  }
}

export default Cat
