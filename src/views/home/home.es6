import { reactive, toRefs } from 'vue'
import { ChatTime } from '@/filter'
import { Avatar, Editor } from 'components'
import { deepClone, timeTalkFilter, goBottom, parseEmojiShowCode, vagueSearchList } from 'utils/common'
import { remote, ipcRenderer } from 'electron'
import websocket from 'utils/websocket'
import Win from 'utils/winOptions'
import { updateBadge } from '@/winset'
import db from '@/db'
import api from 'utils/api'

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
      allChatData: {}
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

    return {
      fileSizeFilter,
      getList,
      initImg,
      initMedia,
      initFileName,
      decodeEmojiHtml
    }
  },
	mounted() {
    // updateBadge('')
    this.init()
	},
  unmounted() {
    ipcRenderer.removeAllListeners('chat-to-chat')
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
      const user = uid === +this.myInfo.uid ? this.myInfo : (this.chatUser && this.chatUser.userInfo)
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
    onChatuserChange(user) {
      if (!user) return false
      this.chatMessageList = this.allChatData[user.uid]
      goBottom()
    },
    onDBMessageChange(msgData) {
      this.allChatData = deepClone(msgData)
      if (this.chatUser) {
        this.chatMessageList = this.allChatData[this.chatUser.uid]
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
