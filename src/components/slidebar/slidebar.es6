import Win from 'utils/winOptions'

export default {
	name: 'slidebar',
	components: {
	},
  props: {
    data: {
      type: Object,
      default: {}
    },
    friendNum: {
      type: Number,
      default: 0
    }
  },
	data () {
		return {
      pages: [
        {
          iconName: 'chat',
          size: '24px',
          path: '#/',
          name: 'Home',
          tag: 0
        },
        {
          iconName: 'list',
          size: '22px',
          path: '#/list',
          name: 'List',
          tag: 0
        }
      ],
      netState: 1,
      routeName: 'Home'
		}
	},
	mounted() {
	},
	methods: {
    showCard(user) {
      Win.card(Object.assign(user, {loginId: user.uid}))
    },
    logout() {
      this.$store.dispatch('setClearData')
      this.$router.push({ path: '/login' })
      this.$emit('logout')
    },
    onFriendNumChange(num) {
      if (!this.pages.length) return
      if (this.routeName === 'List') {
        this.$store.dispatch('setNewFriendNum', 0)
        this.pages[1].tag = 0
      } else {
        this.pages[1].tag = num
      }
    }
	},
  watch: {
    $route(to, from) {
      this.routeName = to.name
      if (this.routeName === 'List') {
        this.$store.dispatch('setNewFriendNum', 0)
      }
    },
    friendNum: {
      handler: 'onFriendNumChange',
      immediate: true,
      deep: true
    }
  },
  computed: {
    info() {
      return this.data
    }
  }
}
