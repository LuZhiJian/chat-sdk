import { reactive, toRefs } from 'vue'
import { ChatTime } from '@/filter'
import { Avatar, Editor } from 'components'
import { deepClone, timeTalkFilter, goBottom, parseEmojiShowCode, HTMLEncode, parseEmoji, vagueSearchList, checkFileIn, resetTime, inTime } from 'utils/common'
import loadFile from 'utils/download'
import { remote, ipcRenderer, clipboard, nativeImage } from 'electron'
import websocket from 'utils/websocket'
import Win from 'utils/winOptions'
import VueAudio from 'components/audio'
import md5 from 'js-md5'
import api from 'utils/api'
import db from '@/db'

export default {
	name: 'home',
	components: {
    ChatTime,
    Avatar,
    Editor,
    'vue-audio': VueAudio
	},
	data () {
		return {
      chatSearchValue: '',
      chattingList: [],
      searchList: [],
      chatMessageList: [],
      allChatData: {},
      noreadData: {},
      receiptList: [],
      receiptKeep: false,
      receiptAble: true
		}
	},
  setup() {
    const fileSizeFilter = value => {
      const kb = value / 1024
      let size = ''
      if (kb >= 1024 * 1024) {
        size = Math.round((kb / 1024 / 1024) * 10) / 10 + 'GB'
      } else if (kb >= 1024) {
        size = Math.round((kb / 1024) * 10) / 10 + 'MB'
      } else if (kb >= 1) {
        size = kb.toFixed(0) + 'KB'
      } else {
        size = value + '字节'
      }
      return size
    }
    // let mmList = reactive({
    //   msgList: []
    // })
    const getList = async (user, lastId) => {
      const msgList = await db.msgDB.getPageData(user, lastId)
      return msgList
    }
    const decodeEmojiHtml = (str) => {
      return parseEmoji(HTMLEncode(str))
    }
    const decodeReadyHtml = (str) => {
      return parseEmoji(str)
    }
    const initImg = (path) => {
      return `file://${path}`
    }
    const initMedia = (path) => {
      return `file://${path}`
    }

    const initFileName = (str, suffix) => {
      if (!str) return ''
      if (str && str.length < 24) return str
      const cutPoint = suffix.length + 3
      const endStr = str.substr(-cutPoint, cutPoint)
      const startStr = str.substr(0, 17)
      return `${startStr}...${endStr}`
    }

    const timeLine = (curTime, prevTime) => {
      let show = true
      if (!curTime) return false
      const timestamp = (curTime - prevTime)/1000/60
      if (timestamp >= 5) {
        show = true
      } else {
        show = false
      }
      return show
    }
    const updateDetail = async (user) => {
      await db.userDB.contacts.update(user)
      await db.userDB.chatUsers.update(user)
    }

    return {
      fileSizeFilter,
      getList,
      initImg,
      initMedia,
      initFileName,
      decodeEmojiHtml,
      decodeReadyHtml,
      timeLine,
      updateDetail
    }
  },
	mounted() {
    this.init()
    remote.getCurrentWindow().on("focus", () => {
      if (this.chatUser && this.myInfo.uid) {
        this.receiptMessage()
      }
    })
	},
  unmounted() {
    ipcRenderer.removeAllListeners('chat-to-chat')
    ipcRenderer.removeAllListeners('chat-user-del')
    ipcRenderer.removeAllListeners('msg-copy')
    ipcRenderer.removeAllListeners('msg-recall')
    ipcRenderer.removeAllListeners('msg-del')
    ipcRenderer.removeAllListeners('msg-show-folder')
    remote.getCurrentWindow().removeAllListeners('focus')
  },
  updated(){
    // goBottom()
  },
	methods: {
    async init() {
      this.chattingList = await this.$chatUsersDB.getChattingList()
      this.chattingList.map(async o => {
        await this.getList(o)
      })
      ipcRenderer.on('chat-to-chat', async (event, data) => {
        const user = await this.$contactsDB.getContactDetail(data.uid) || await api.contactDetail({ param: { targetUid: data.uid } })
        this.chatting(user)
      })
      ipcRenderer.on('chat-user-del', (event, arg) => {
        remote.dialog.showMessageBox({
          title: '提示',
          message: '确定删除该聊天回话吗？',
          buttons: ['确定', '取消'],
          cancelId: 1,
          noLink: true,
          defaultId: 0
        }).then(res => {
          if (res.response === 0) {
            this.$chatUsersDB.delete(arg.item).then(async qaq => {
              if (qaq.code === 200) {
                await this.$msgDB.deleteUser(arg.item)
                this.chattingList = await this.$chatUsersDB.getChattingList()
              }
            })
          }
        })
      })
      ipcRenderer.on('msg-copy', (event, arg) => {
        if (arg.item.msgType === 2 || arg.item.msgType === 5) {
          let image = nativeImage.createFromPath(arg.item.url || arg.item.thumbURL)
          clipboard.writeImage(image)
        } else if (arg.item.msgType === 1) {
          document.execCommand("Copy")
        }
      })
      ipcRenderer.on('msg-recall', (event, arg) => {
        const recallMsg = {
          msgId: arg.item.msgId,
          targetUid: arg.item.toUid
        }
        websocket.send(4, recallMsg)
      })
      ipcRenderer.on('msg-del', (event, arg) => {
        const msg = deepClone(arg.item)
        msg.index = msg.msgId ? 'msgId' : 'flag'
        db.msgDB.delete(msg)
      })
      ipcRenderer.on('msg-show-folder', (event, arg) => {
        this.openFile(arg.item)
      })
    },
    showCard(uid) {
      const user = uid !== +this.myInfo.uid ? this.myInfo : (this.chatUser && this.chatUser.userInfo)
      const userData = Object.assign(user, {loginId: this.myInfo.uid})
      Win.card(userData)
    },
    searchChatList() {
      const str = this.chatSearchValue
      this.searchList = vagueSearchList(this.chattingList, str)
    },
    clear() {
      this.chatSearchValue = ''
      this.$refs.search.focus()
    },
    async chatting(item) {
      let detail = deepClone(item)
      if (this.$refs.editor) {
        this.$refs.editor.clearInput()
        this.$refs.editor.getFocus()
      }
      if (inTime(item.getApiTime) >= 2) {
        detail.userInfo = (await api.contactDetail({ param: { targetUid: item.uid } })).userInfo
        detail.getApiTime = new Date().getTime()
        this.chattingList.map(o => {
          if (o.uid === item.uid) {
            o.userInfo = detail.userInfo
            o.getApiTime = detail.getApiTime
          }
        })
        this.updateDetail(detail)
      }
      this.$store.dispatch('setChatUser', detail)
    },
    send(data) {
      const sign = new Date().getTime()
      const sendData = Object.assign(data, {
        fromUid: this.myInfo.uid,
        flag: sign,
        time: sign
      })
      if (sendData.tgype === 1 || sendData.msgType === 1) {
        sendData.content.content = HTMLEncode(sendData.content.content)
      }
      websocket.send(2, sendData)
    },
    cancelUpload(msg) {
      this.$refs.editor.cancelUpload(msg)
    },
    //语音已播放状态
    onPlay(v) {
      const msg = deepClone(v)
      msg.index = 'msgId'
      msg.noListen = false
      db.msgDB.update(msg)
    },
    async openFile(item) {
      if (item.progress && item.progress !== 100) return false
      const check = await checkFileIn(item.url)
      if (check) {
        remote.shell.showItemInFolder(item.url)
      } else {
        this.$notify.open('error', '文件状态异常，无法打开。')
      }
    },
    //下载文件
    async downloadFile(msg, isDownload) {
      const that = this
      const item = deepClone(msg)
      if (item.progress && item.progress < 100) {
        item.fileUrl = ''
        this.cancelUpload(item)
        return false
      } else if (item.url) {
        const isPic = [2, 6].includes(item.msgType)
        if (isPic) return false
        this.openFile(item)
        return false
      } else {
        const chatMssList = deepClone(this.allChatData[item.uid])
        const suffix = item.msgType === 2 ? 'png' : 'gif'
        // 下载中的时候防止再次执行下载
        if (item.loadsize && item.loadsize < item.content.fileSize) {
          loadFile(false, () => {
            const find = chatMssList.find(o => o.msgId === item.msgId)
            find.loadsize = 0
            find.url = ''
            find.percent = 0
            find.index = 'msgId'
            db.msgDB.update(find)
          })
        } else {
          loadFile(Object.assign(item, {
            download: true,
            chatUid: item.uid,
            type: item.msgType,
            fileUrl: item.content.url,
            size: item.content.fileSize,
            name: `${md5(item.content.url)}.${suffix}`,
            msgId: item.msgId
          }), (data) => {
            const find = chatMssList.find(o => o.msgId === item.msgId)
            if (data.locUrl.length > 0 && isDownload) {
              remote.getCurrentWebContents().downloadURL(data.locUrl)
            }
            find.loadsize = Number(data.loadsize)
            find.url = data.locUrl
            find.percent = Number(data.percent)
            find.index = 'msgId'
            db.msgDB.update(find)
          })
        }
      }
    },
    showChatuserRtKey(event, e, item) {
      const data = deepClone({
        type: 'chat-user',
        item
      })
      ipcRenderer.send(e, data)
    },
    async showChatRclickList(event, e, item) {
      let check = true
      if ([2, 3, 4, 6, 7].includes(item.msgType)) {
        check = item.url ? await checkFileIn(item.url) : false
      }
      const data = deepClone({
        type: 'msg',
        item,
        loginId: this.myInfo.uid,
        fileCheck: check,
        ddTime: (new Date().getTime() - item.time)/(1000 * 60)
      })
      ipcRenderer.send(e, data)
    },
    // 获取消息列表未读数量
    getNum(msgList) {
      if (!msgList) return 0
      this.chattingList.map(o => {
        let list = msgList[o.uid] || []
        let noreadList = list.filter(v => {
          return v.read === false
        })
        this.noreadData[o.uid] = noreadList.length
      })
    },
    // 更新回话列表用户的显示消息
    lastMsg(list, id) {
      if (!list || list.length) return ''
      // 草稿
      const txtObj = this.$store.state.readyText
      const readyTxt = this.chatUser.uid === id ? '' : txtObj[id]
      if (readyTxt) {
        const en_txt = HTMLEncode(readyTxt)
        return `<span>[草稿]</span>${en_txt}`
      }
      const obj = list[id] && list[id][list[id].length - 1]
      let msg = ''
      if (!obj) return ''
      switch (obj && +obj.msgType) {
        case 1:
          msg = HTMLEncode(obj.content.content)
          break;
        case 2:
          msg = '[图片]'
          break;
        case 3:
          msg = '[语音]'
          break;
        case 4:
          msg = '[视频]'
          break;
        case 6:
          msg = '[动态表情]'
          break;
        case 7:
          msg = `[文件]${obj.key}`
          break;

        default:
          msg = `[未知类型]`
          break;
      }
      // console.log(msg)
      return msg
    },
    // 逐条处理回执信息
    catOneMessage() {
      return new Promise(async resolve => {
        if (this.receiptList.length) {
          websocket.send(3, this.receiptList[0])
          setTimeout(async () => {
            this.receiptList.splice(0, 1)
            if (this.receiptList.length) {
              await this.catOneMessage()
            } else {
              this.receiptAble = true
              this.receiptKeep = false
            }
          }, 100)
          resolve(true)
        } else {
          resolve(true)
        }
      })
    },
    //消息回执
    async receiptMessage() {
      if (this.$route.name !== 'Home') return false
      if (!this.chatUser) return false
      if (!this.myInfo || !this.myInfo.uid) return false
      const chatId = this.chatUser.uid
      const loginId = this.myInfo.uid
      if (!this.allChatData[chatId]) return false
      this.allChatData[chatId].map(o => {
        if (o.fromUid !== loginId && o.read === false) {
          const data = {
            msgId: o.msgId,
            targetUid: o.fromUid,
            msgStatus: 2
          }
          o.read = true
          this.receiptList.push(data)
        }
      })
      this.receiptAble = false
      if (!this.receiptKeep) {
        this.receiptKeep = true
        try {
          await this.catOneMessage()
        } catch {
          this.receiptKeep = false
        } finally {
          this.receiptKeep = false
        }
      }
      this.$store.dispatch('setDBMessageData', this.allChatData)
    },
    async onChatuserChange(user) {
      if (!user) return false
      this.chatMessageList = this.allChatData[user.uid]
      const find = this.chattingList.find(o => o.uid === user.uid)
      if (!find) {
        this.chattingList = await this.$chatUsersDB.getChattingList()
      }
      if (remote.getCurrentWindow().isVisible()) {
        this.receiptMessage()
      }
      goBottom()
    },
    onDBMessageChange(msgData) {
      this.allChatData = deepClone(msgData)
      this.getNum(this.allChatData)
      if (this.chatUser) {
        this.chatMessageList = this.allChatData[this.chatUser.uid]
        if (remote.getCurrentWindow().isFocused() && this.receiptAble) {
          this.receiptMessage()
        }
        goBottom()
      }
    }
	},
  watch: {
    chatUser: {
      handler: 'onChatuserChange',
      immediate: true,
      deep: true
    },
    dbMessage: {
      handler: 'onDBMessageChange',
      immediate: true,
      deep: true
    },
  },
  computed: {
    chatUser() {
      return deepClone(this.$store.state.chattingUser)
    },
    myInfo() {
      const loginData = this.$store.state.loginData
      const myInfo = (loginData && loginData.userInfo) || {}
      return myInfo
    },
    dbMessage() {
      return this.$store.state.dbMessageData
    }
  }
}
