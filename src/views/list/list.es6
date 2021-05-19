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
    getList() {
      const param = Object.assign({
        time: this.getListTimeStr || new Date().getTime()
      }, this.pageQuery)
      api.contactList({
        param
      }).then(async (res) => {
        if (res.contactList) {
          res.contactList.map(o => o.uid = o.userInfo.uid)
          this.$store.dispatch('setContactsTime', res.lastUpdateTime)
          this.list = res.contactList
          this.contactCount = res.count
          await this.$contactsDB.saveContacts(res.contactList)
        } else {
          this.list = await this.$contactsDB.getContacts()
          this.contactCount = this.list.length
        }
      }).catch(async () => {
        this.list = await this.$contactsDB.getContacts()
        this.contactCount = this.list.length
      })
    },
    getApplyList() {
      api.contactApplyList().then(res => {
        const unRecordList = deepClone(res.unRecordList || [])
        const recordList = deepClone(res.recordList || [])
        unRecordList.map(o => {
          o.status = intervalTime(o.modifyTime) >= 7 ? 3 : 1 // 等待验证
          o.uid = o.userInfo.uid
        })
        recordList.map(o => {
          o.status = 2 // 已操作
          o.uid = o.userInfo.uid
        })
        const all = [...unRecordList, ...recordList]
        all.sort((a, b) => {
          return b.modifyTime - a.modifyTime
        })
        this.applyList = all
        console.log(this.applyList)
      })
    },
    showing(user) {
      this.$store.dispatch('setContactsShowUser', user)
    },
    showAvatar(user) {
      const winData = Win.avatar(user)
    },
    apply(op) {
      const param = {
        targetUid: this.showUser.userInfo.uid,
        op: op
      }
      api.updateApply({ param }).then(res => {
        const newUser = op === 3 ? null : deepClone(this.showUser)
        if (newUser) {
          newUser.status = 2
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
    }
  },
  watch: {},
  computed: {
    getListTimeStr() {
      return this.$store.state.contactsTime
    },
    showUser() {
      return deepClone(this.$store.state.contactsShowUser)
    }
  }
}
