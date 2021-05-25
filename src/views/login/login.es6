import api from 'utils/api'

export default {
	name: 'login',
	components: {
	},
	data () {
		return {
      code: ''
		}
	},
	mounted() {
	},
	methods: {
    login() {
      const param = {
        code: this.code.toUpperCase()
      }
      api.login({ param }).then((res) => {
        this.$store.dispatch('setLoginData', res)
        this.$router.push({ path: '/' })
      }).catch(err => {
        this.$notify.open('error', '授权码不正确~')
      })
    }
	}
}
