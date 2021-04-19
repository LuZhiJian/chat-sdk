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
          tag: 1
        },
        {
          iconName: 'list',
          size: '22px',
          path: '#/list',
          name: 'List'
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
      Win.card(user)
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