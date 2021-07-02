import { remote, ipcRenderer } from 'electron'
import avatar from 'assets/avatar.png'

export default {
  name: 'msg',
  components: {},
  data() {
    return {
      msgList: [],
      count: 0,
      avatar
    }
  },
  mounted() {
    ipcRenderer.on('set-data', (event, arg) => {
      this.msgList = arg.newMsgList
      let count = 0;
      this.msgList.forEach(item => {
        count += item.msgNum
      });
      this.count = count
    })
  },
  unmounted() {
    ipcRenderer.removeAllListeners('set-data')
  },
  methods: {
    windowSH(e, show, uId) {
      let SH = show === false ? false : true
      ipcRenderer.send(e, {
        winName: "msgWindow",
        SH,
        listNum: show,
        uId
      })
      if (SH) {
        this.msgList.splice(show, 1)
        let count = 0;
        this.msgList.forEach(item => {
          count += item.msgNum
        });
        this.count = count
      }
      let msgHeight = 70 + 45 * this.msgList.length

      remote.getCurrentWindow().setBounds({
        height: msgHeight,
        y: remote.getCurrentWindow().getBounds().y + (remote.getCurrentWindow().getBounds().height - msgHeight)
      })
    }
  }
}
