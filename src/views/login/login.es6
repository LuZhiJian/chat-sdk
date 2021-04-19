import api from 'utils/api'

export default {
	name: 'login',
	components: {
	},
	data () {
		return {
      code: '5VKVXXFW'
		}
	},
	mounted() {
	},
	methods: {
    login() {
      const param = {
        code: this.code
      }
      api.login({ param }).then((res) => {
        this.$store.dispatch('setLoginData', res)
        this.$router.push({ path: '/' })
      })
    }
	}
}
