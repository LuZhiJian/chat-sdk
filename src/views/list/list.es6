import api from 'utils/api'
import { Avatar } from 'components'
import Win from 'utils/winOptions'
import { deepClone } from 'utils/common'
import { ipcRenderer } from 'electron'

export default {
	name: 'list',
	components: {
    Avatar
	},
	data () {
		return {
      searchValue: '',
      pageQuery: {
        pageNum: 1,
        pageSize: 10000
      },
      list: [],
      contactCount: 0
		}
	},
	mounted() {
    this.getList()
	},
	methods: {
    clear() {
      this.searchValue = ''
      this.$refs.search.focus()
    },
    getList() {
      const param = Object.assign({
        time: this.getListTimeStr || new Date().getTime()
      }, this.pageQuery)
      api.contactList({ param }).then(async (res) => {
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
    showing(user) {
      this.$store.dispatch('setContactsShowUser', user)
    },
    showAvatar(user) {
      const winData = Win.avatar(user)
    },
    chatting() {
      const user = this.showUser
      console.log(user)
      this.$store.dispatch('setChatUser', user)
      this.$chatUsersDB.addChatUser(user)
      setTimeout(() => {
        this.$router.push({ path: '/' })
      }, 100)
    }
	},
  watch: {
  },
  computed: {
    getListTimeStr() {
      return this.$store.state.contactsTime
    },
    showUser() {
      return deepClone(this.$store.state.contactsShowUser)
    }
  }
}
