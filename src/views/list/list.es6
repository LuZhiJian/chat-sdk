import api from 'utils/api'
import { Avatar } from 'components'
import Win from 'utils/winOptions'
import { deepClone, vagueSearchList, intervalTime } from 'utils/common'
import { ipcRenderer } from 'electron'

export default {
  name: 'list',
  components: {
    Avatar
  },
  data() {
    return {
      searchValue: '',
      pageQuery: {
        pageNum: 1,
        pageSize: 10000
      },
      list: [],
      applyList: [],
      searchList: [],
      contactCount: 0,
      newTabVisible: true,
      contactsTabVisible: true
    }
  },
  setup() {
    const initStatus = (status) => {
      let txt = ''
      switch (status) {
        case 2:
          txt = '已添加'
          break;
        case 3:
          txt = '已过期'
          break;
        default:
          txt = '等待验证'
          break;
      }
      return txt
    }
    return {
      initStatus
    }
  },
  mounted() {
    this.getList()
    this.getApplyList()
    ipcRenderer.on('new-user-del', async (event, arg) => {
      this.apply(3, arg.item)
      await this.$newUsersDB.delete(arg.item)
      this.getApplyList()
    })
  },
  unmounted() {
    ipcRenderer.removeAllListeners('new-user-del')
  },
  methods: {
    clear() {
      this.searchValue = ''
      this.$refs.search.focus()
    },
    searchChatList() {
      const str = this.searchValue
      this.searchList = vagueSearchList(this.list, str)
    },
    async getList() {
      this.list = await this.$contactsDB.getContacts()
      this.contactCount = this.list.length
    },
    async getApplyList() {
      this.applyList = await this.$newUsersDB.getNewUsersList()
    },
    rightClick(event, e, item) {
      const data = deepClone({
        type: 'new-user',
        item
      })
      ipcRenderer.send(e, data)
    },
    showing(user) {
      this.$store.dispatch('setContactsShowUser', user)
    },
    showAvatar(user) {
      const winData = Win.avatar(user)
    },
    async apply(op, user) {
      const param = {
        targetUid: user.uid,
        op: op
      }
      api.updateApply({ param }).then(async res => {
        const newUser = op === 3 ? null : deepClone(user)
        if (newUser) {
          newUser.status = 2
          await this.$newUsersDB.update(newUser)
        }
        this.showing(newUser)
        this.getApplyList()
      }).catch(() => {
        this.$notify.open('error', '操作响应失败~请重试！')
      })
    },
    chatting() {
      const user = this.showUser
      this.$store.dispatch('setChatUser', user)
      this.$chatUsersDB.addChatUser(user)
      setTimeout(() => {
        this.$router.push({
          path: '/'
        })
      }, 100)
    },
    onFriendNumChange(val) {
      this.getApplyList()
    }
  },
  watch: {
    friendNum: {
      handler: 'onFriendNumChange',
      immediate: true,
      deep: true
    }
  },
  computed: {
    getListTimeStr() {
      return this.$store.state.contactsTime
    },
    showUser() {
      return deepClone(this.$store.state.contactsShowUser)
    },
    friendNum() {
      return +this.$store.state.newFriendNum
    }
  }
}
