import { ChatTime } from '@/filter'
import { Avatar, Editor } from 'components'
import { deepClone } from 'utils/common'
import { updateBadge } from '@/winset'

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
      chattingList: []
		}
	},
	mounted() {
    // updateBadge('')
    this.init()
	},
  updated(){
    // 聊天定位到底部
    let ele = document.getElementById('message-scroll')
    ele.scrollTop = ele.scrollHeight
  },
	methods: {
    async init() {
      this.chattingList = await this.$chatUsersDB.getChattingList()
    },
    clear() {
      this.chatSearchValue = ''
      this.$refs.search.focus()
    },
    chatting(item) {
      this.$store.dispatch('setChatUser', item)
    }
	},
  computed: {
    chatUser() {
      return deepClone(this.$store.state.chattingUser)
    }
  }
}
