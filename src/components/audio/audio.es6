export const baseVolumeValue = 7.5

export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx'.replace(/[xy]/g, function (c) {
    let v, r
    r = Math.random() * 16 | 0; v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export const convertTimeHHMMSS = (val) => {
  let hhmmss = new Date(val * 1000).toISOString().substr(11, 8)
  return (hhmmss.indexOf('00:') === 0) ? hhmmss.substr(3) : hhmmss
}

export default {
  name: 'vue-audio',
  props: {
    file: {
      type: String,
      default: null
    },
    autoPlay: {
      type: Boolean,
      default: false
    },
    loop: {
      type: Boolean,
      default: false
    },
    whoForm: {
      type: String,
      default: null
    },
    noListen: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    duration: function () {
      return this.audio ? convertTimeHHMMSS(this.totalDuration) : ''
    },
    playerId: function () {
      return 'player-' + this.uuid
    },
  },
  data () {
    return {
      isMuted: false,
      isNoListen: true,
      loaded: false,
      playing: false,
      paused: true,
      currentTime: '00:00',
      uuid: '0',
      innerLoop: undefined,
      audio: undefined,
      totalDuration: 0,
      hideVolumeSlider: false,
      volumeValue: baseVolumeValue
    }
  },
  methods: {
    setPosition: function name (e) {
      let tag = e.target
      if (this.paused) return

      if (e.target.tagName === 'SPAN') {
        return
      }
      const pos = tag.getBoundingClientRect()
      const seekPos = (e.clientX - pos.left) / pos.width
      this.audio.currentTime = Math.round(this.audio.duration * seekPos)
    },
    updateVolume() {
      this.hideVolumeSlider = false
      this.audio.volume = this.volumeValue / 100
      if (this.volumeValue / 100 > 0) {
        this.isMuted = this.audio.muted = false
      }
      if (this.volumeValue / 100 === 0) {
        this.isMuted = this.audio.muted = true
      }
    },
    toggleVolume() {
      this.hideVolumeSlider = true
    },
    stop() {
      this.playing = false
      this.paused = true
      this.audio.pause()
      // this.audio.currentTime = 0
    },
    play() {
      if (this.playing && !this.paused) return
      this.paused = false
      this.audio.play()
      this.playing = true
    },
    pause() {
      this.$emit('onPlay')
      this.paused = !this.paused;
      (this.paused) ? this.audio.pause() : this.audio.play()
    },
    changeLoop() {
      this.innerLoop = !this.innerLoop
    },
    download() {
      this.stop()
      window.open(this.file, 'download')
    },
    onListenChange(val) {
      this.isNoListen = val
    },
    mute() {
      this.isMuted = !this.isMuted
      this.audio.muted = this.isMuted
      this.volumeValue = this.isMuted ? 0 : 75
    },
    _handleLoaded() {
      if (this.audio.readyState >= 2) {
        if (this.autoPlay) this.play()

        this.loaded = true
        this.totalDuration = Math.round(this.audio.duration)
      } else {
        throw new Error('Failed to load sound file')
      }
    },
    changeAudioTime(e) {//改变音频时间
      let odiv = this.$refs.progressTg;        //获取目标元素
      let width = 120,
          isDrag = false
      //算出鼠标相对元素的位置
      let disX = e.clientX - odiv.getBoundingClientRect().left;

      document.onmousemove = (e)=>{
        let poi = e.clientX - odiv.getBoundingClientRect().left
        if(poi<=0){
          this.$refs.audiofile.currentTime = 0
        }else if (poi>= width){
          this.$refs.audiofile.currentTime = this.totalDuration
        }else{
          this.$refs.audiofile.currentTime =  poi / width * this.totalDuration
        }
        isDrag = true
        this.$refs.audiofile.pause();
      };
      document.onmouseup = (event) => {
          document.onmousemove = null;
          document.onmouseup = null;
          this.$refs.audiofile.currentTime == this.totalDuration?'':this.$refs.audiofile.play()
      };
      if(!isDrag){
        this.$refs.audiofile.currentTime =  disX / width * this.totalDuration
      }
    },
    _handlePlayingUI(e) {
      let currTime = Math.round(this.audio.currentTime)
      let percentage = Math.round((currTime / this.totalDuration) * 100)
      this.$refs.progressTg.style.width = percentage + '%';
      this.currentTime = convertTimeHHMMSS(currTime)
    },
    _handlePlayPause(e) {
      if (e.type === 'pause' && this.playing === false) {
        this.paused = true
        // 进度条设置为0
        if (this.audio.currentTime === this.audio.duration) {
          this.audio.currentTime = 0
        }
      }
    },
    init() {
      this.audio.addEventListener('timeupdate', this._handlePlayingUI)
      this.audio.addEventListener('loadeddata', this._handleLoaded)
      this.audio.addEventListener('pause', this._handlePlayPause)
      this.audio.addEventListener('play', this._handlePlayPause)
    },
    getAudio() {
      return this.$el.querySelectorAll('audio')[0]
    }
  },
  mounted() {
    this.uuid = generateUUID()
    this.audio = this.getAudio()
    this.innerLoop = this.loop
    this.init()
  },
  watch: {
    noListen: {
      handler: 'onListenChange',
      immediate: true,
      deep: true
    },
  },
  unmounted() {
    this.audio.removeEventListener('timeupdate', this._handlePlayingUI)
    this.audio.removeEventListener('loadeddata', this._handleLoaded)
    this.audio.removeEventListener('pause', this._handlePlayPause)
    this.audio.removeEventListener('play', this._handlePlayPause)
  }
}
