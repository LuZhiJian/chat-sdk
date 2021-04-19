import constant from './constant'
import store from '../store'
import { getAesString, getDAesString, stringToUint8Array, uint8ArrayToString } from './aes'

const Cat = {
  sendFun(code, data) {
    return new Promise(resolve => {
      const loginData = store.state.loginData || {}
      const messageContent = code === 1000 ? {
        sessionId: loginData.sessionId,
        plat: 3,
        version: constant.SDK_VERSION
      } : data
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
        switch (protorlId) {
          case 2000:
            console.log('websocket 登录成功!');
            break;
          case 2001:
            console.log('心跳回应!');
            break;
          default:
            break;
        }
        const msgContent = getDAesString(new Uint8Array(buff.slice(8)), constant.API_KEY)
        const res = JSON.parse(uint8ArrayToString(msgContent));
        resolve(res);
      }
    })
  }
}

export default Cat
