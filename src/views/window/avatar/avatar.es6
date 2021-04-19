import { ipcRenderer } from 'electron'
import { MinWinButton } from 'components'

export default {
	name: 'avatar',
	components: {
    MinWinButton
	},
  setup() {

  },
	data () {
		return {
      imgUrl: ''
		}
	},
	mounted() {
    ipcRenderer.on('avatar-data', (event, arg) => {
      this.imgUrl = arg.icon
    })
	},
  unmounted() {
    ipcRenderer.removeAllListeners('avatar-data')
  },
	methods: {

	}
}
