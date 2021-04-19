import api from 'utils/api'
import { Avatar } from 'components'
import Win from 'utils/winOptions'
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
      contactCount: 0,
      showUser: null
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
        // time: this.getListTimeStr || new Date().getTime()
        time: new Date().getTime()
      }, this.pageQuery)
      api.contactList({ param }).then((res) => {
        console.log(res)
        this.list = res.contactList
        this.contactCount = res.count
        this.$store.dispatch('setContactsTime', res.lastUpdateTime)
      })
    },
    showing(user) {
      this.showUser = user
    },
    showAvatar(user) {
      const winData = Win.avatar(user)
    }
	},
  computed: {
    getListTimeStr() {
      return this.$store.state.contactsTime
    }
  }
}
