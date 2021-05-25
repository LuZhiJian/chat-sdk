import { reactive, toRefs } from 'vue'
import { ChatTime } from '@/filter'
import { Avatar, Editor } from 'components'
import { deepClone, timeTalkFilter, goBottom, parseEmojiShowCode, vagueSearchList } from 'utils/common'
import { remote, ipcRenderer } from 'electron'
import websocket from 'utils/websocket'
import { updateBadge } from '@/winset'
import Win from 'utils/winOptions'
import api from 'utils/api'
import db from '@/db'

export default {
	name: 'home',
	components: {
    ChatTime,
    Avatar,
    Editor
	},
	data () {
		return {
      chatSearchValue: '',
      chattingList: [],
      searchList: [],
      chatMessageList: [],
      allChatData: {},
      msgNum: 0,
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
      return parseEmojiShowCode(str)
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

    const getNum = (msgList, user) => {
      if (!msgList) return 0
      let len = 0
      const list = msgList[user.uid] || []
      const noreadList = list.filter(o => {
        return o.read === false
      })
      len = noreadList.length
      return len
    }

    return {
      fileSizeFilter,
      getList,
      initImg,
      initMedia,
      initFileName,
      decodeEmojiHtml,
      timeLine,
      getNum
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
    chatting(item) {
      this.$store.dispatch('setChatUser', item)
    },
    send(data) {
      const sign = new Date().getTime()
      const sendData = Object.assign(data, {
        fromUid: this.myInfo.uid,
        flag: sign,
        time: sign
      })
      websocket.send(2, sendData)
    },
    cancelUpload(msg) {
      this.$refs.editor.cancelUpload(msg)
    },
    openFile(item) {
      if (item.progress !== 100) return false
      remote.shell.showItemInFolder(item.content.url)
    },
    // 更新回话列表用户的显示消息
    lastMsg(list, id) {
      if (!list || list.length) return ''
      const obj = list[id] && list[id][list[id].length - 1]
      let msg = ''
      if (!obj) return ''
      switch (obj && +obj.msgType) {
        case 1:
          msg = obj.content.content
          break;
        case 2:
          msg = obj.suffix === 'gif' ? '[动图]' : '[图片]'
          break;
        case 3:
        case 4:
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
      if (!this.chatUser) return false
      if (!this.myInfo.uid) return false
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
      this.msgNum = 0
      Object.keys(msgData).forEach((key) => {
        const oneNum = msgData[key].filter(o => o.read === false)
        this.msgNum += oneNum.length
      })
      updateBadge(this.msgNum)
      this.allChatData = deepClone(msgData)
      if (this.chatUser) {
        this.chatMessageList = this.allChatData[this.chatUser.uid]
        console.log(this.receiptAble)
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
