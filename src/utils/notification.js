import { remote } from 'electron'
import store from '../store'
import { HTMLEncode } from 'utils/common'

const sysForWin = process.platform === 'win32'

const initMsg = (msg) => {
  let content = ''
  switch (+msg.msgType) {
    case 1:
      content = HTMLEncode(obj.content.content)
      break;
    case 2:
      content = '[图片]'
      break;
    case 3:
      content = '[语音]'
      break;
    case 4:
      content = '[视频]'
      break;
    case 5:
      content = `[系统消息]`
      break;
    case 6:
      content = '[动态表情]'
      break;
    case 7:
      content = `[文件]${obj.key}`
      break;
    default:
      content = `[未知类型]`
      break;
  }
  return content
}

const macMessage = {
  initAlert: (data) => {
    if (sysForWin) return
    if (!data) return
    const loginData = store.state.loginData
    const myInfo = (loginData && loginData.userInfo) || {}
    const myId = myInfo.uid
    if (myId === data.fromUid) return
    let option = {
      title: `${data.showName}`,
      body: '发来一条新消息',
      //通知是否静音。非必须，默认为false，表示无声
      silent: true
      // sound: receiveMsg
    }
    // 创建通知并保存
    let hhwNotication = new Notification(option.title, option)
    hhwNotication.onclick = () => {
      remote.getCurrentWindow().show()
    }
  }
}

export default macMessage
