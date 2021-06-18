import { remote, ipcRenderer } from 'electron'
import { MinWinButton } from 'components'

export default {
	name: 'media',
	components: {
    MinWinButton
	},
  setup() {
    const initImg = (path) => {
      return `file://${path}`
    }
    const initMedia = (path) => {
      return `file://${path}`
    }
    return {
      initImg,
      initMedia
    }
  },
	data () {
		return {
      data: {}
		}
	},
	mounted() {
    ipcRenderer.on('media-data', (event, arg) => {
      this.data = arg
      const windata = arg.content
      const screenWidth = window.screen.availWidth
      const screenHeight = window.screen.availHeight
      if (!windata) return false
      let { width, height } = windata
      if(height >= 910 && width >= 1600){
        height = Math.min(988, screenHeight)
        height = height - 78
        width = width = Math.min(1600, screenWidth)
      }else if(windata.height >= 910){
        height = Math.min(988, screenHeight)
        height = height - 78
        width = width = parseInt((windata.width * height)/windata.height)
      }else if(windata.width >= 1600){
        width = Math.min(1600, screenWidth)
        height = parseInt((windata.height * width)/windata.width)
      }else{
        width = windata.width,
        height = windata.height
      }

      const mHeight = height + 24
      remote.getCurrentWindow().setBounds({
        width: width,
        height: mHeight
      });
      remote.getCurrentWindow().center();
      remote.getCurrentWindow().show();
    })
	},
  unmounted() {
    const myvideo = document.getElementById('video')
    if (myvideo) {
      myvideo.pause()
    }
    ipcRenderer.removeAllListeners('media-data')
  },
	methods: {
    rightKey(event, e, item) {

    }
	}
}
