import Win from 'utils/winOptions'

export default {
	name: 'slidebar',
	components: {
	},
  props: {
    data: {
      type: Object,
      default: {}
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
    }
	},
  watch: {
    $route(to, from) {
      this.routeName = to.name;
    }
  },
  computed: {
    info() {
      return this.data
    }
  }
}
