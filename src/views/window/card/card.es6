import { ipcRenderer } from 'electron'
import Win from 'utils/winOptions'

const cutName = (str) => {
  if (str && str.length > 18) return `${str.substr(0, 18)}...`
  return str
}

export default {
	name: 'card',
	components: {
	},
	data () {
		return {
      cardData: {
        nickName: ''
      }
    }
	},
	mounted() {
    ipcRenderer.on('card-data', (event, arg) => {
      this.cardData = arg
    })
	},
  unmounted() {
    ipcRenderer.removeAllListeners('card-data')
  },
	methods: {
    showAvatar(info) {
      Win.avatar(info)
    }
	}
}
