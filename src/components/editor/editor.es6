import { ref, computed, watch, reactive, toRefs } from 'vue'
import EmojiFace from 'components/emojiFace'
import RangeUtil from 'components/emojiFace/rangeUtil'
import UploadFile from 'components/common/UploadFile.vue'
import { getEmojiImgSrc, parseEmoji, decodeEmoji, keepLastIndex, checkFile, matchType } from 'utils/common'
import fileFix from 'utils/fileSend'

export default {
	name: 'editor',
	components: {
    EmojiFace,
    UploadFile
	},
	data () {
		return {
      curContent: '',
      emoji: false,
      selection: null,
      trueContent: ''
		}
	},
  props: {
    chatuser: Object
  },
  setup(props, context) {
    let userObj = reactive({
      newUser: {}
    })
    watch(()=> props.chatuser, (newObj, oldObj)=>{
      userObj.newUser = newObj
      // context.emit('send', {})
    }, {
      deep: true,
      immediate: true
    })
    const uploadData = (data) => {
      fileFix.ready(data)
    }
    const getProgress = (data) => {
      fileFix.progress(data)
    }
    const uploadRrror = (data) => {
      fileFix.error(data)
    }
    const uploadCancel = (data) => {
      fileFix.cancel(data)
    }
    const uploadSuccess = (data) => {
      fileFix.finish(data)
    }
    return {
      uploadData,
      getProgress,
      uploadRrror,
      uploadCancel,
      uploadSuccess,
      ...toRefs(userObj)
    }
  },
	mounted() {
    document.body.addEventListener('click', this.hideFaceHandle)
	},
  unmounted() {
    document.body.removeEventListener('click', this.hideFaceHandle)
	},
	methods: {
    selectEmoji(value) {
      this.insertFace(value)
      this.emoji = false
    },
    hideFaceHandle() {
      this.emoji = false
    },
    insertFace(value) {
      const img = new Image()
      img.src = getEmojiImgSrc(value)
      img.alt = value
      const $input = this.$refs.textarea
      $input.focus()
      if (this.selection) {
        RangeUtil.restoreSelection(this.selection)
      }
      this.$nextTick(() => {
        try {
          RangeUtil.replaceSelection(img)
          $input.focus()
          this.trueContent = $input.innerHTML.replace(/(^\s*)|(\s*$)/g, "")
        } catch (e) {
          /* eslint-disable no-console */
          console.error(e)
        }
      })
    },
    // 换行并重新定位光标位置
    textareaRange() {
      var el = this.$refs.textarea
      var range = document.createRange()
      //返回用户当前的选区
      var sel =  document.getSelection()
      //获取当前光标位置
      var offset = sel.focusOffset
      //div当前内容
      var content = el.innerHTML
      //添加换行符\n
      // console.log(content)
      // console.log(content.indexOf('\n'))
      el.innerHTML = content.slice(0, offset)+'\n'+content.slice(offset)
      // console.log(el.innerHTML.indexOf('\n'))
      //设置光标为当前位置
      range.setStart(el.childNodes[0], offset+1)
      //使得选区(光标)开始与结束位置重叠
      range.collapse(true)
      //移除现有其他的选区
      sel.removeAllRanges()
      //加入光标的选区
      sel.addRange(range)
    },
    hasFocus() {
      return document.activeElement === this.$refs.textarea
    },
    saveSelection() {
      if (this.hasFocus()) {
        this.selection = RangeUtil.saveSelection()
      }
    },
    faceClickHandle() {
      this.emoji = !this.emoji
    },
    inputHandle(event) {
      const value = event.target.innerHTML
      this.trueContent = value.replace(/(^\s*)|(\s*$)/g, "")
      // this.curContent = this.trueContent
      // console.log(this.$refs.textarea)
      // this.$nextTick(() => {
      //   keepLastIndex(this.$refs.textarea)
      // })
    },
    async dragHandle(e) {
      // console.log(e)
      const file = e.dataTransfer.files[0]
      const size = file.size / 1024 / 1024
      if (size > 50) {
        this.$notify.open("error", "文件大小不能超过50M")
        return false
      } else if (this.$store.state.netState === 'offline') {
        this.$notify.open("error", '网络不可用！请检查您的网络')
        return false
      }
      const isFile = await checkFile(file)
      if (file && isFile) {
        const fileType = matchType(file.name).type
        if ([2,3,4].includes(fileType)) {
          this.$refs.uploaders.uploadingFun(file)
        } else {
          this.$notify.open("warning", 'Sorry~暂未开通发送文件功能噢')
        }
      }
      return false
    },
    pasteHandle(e) {
      let data = (e.clipboardData || window.clipboardData)
      if (!data && !data.items) {
        return false
      }
      const item = data.items[0]
      if (item && item.kind === 'string') {
        item.getAsString(str => {
          // str 是获取到的字符串
          const $input = this.$refs.textarea
          this.pasteHtmlAtCaret(str)
          const value = decodeEmoji($input.innerHTML)
          this.trueContent = value.replace(/(^\s*)|(\s*$)/g, "")
        })
      }
      return false
    },
    //光标位置插入内容
    pasteHtmlAtCaret(html) {
      let sel, range;
      if (window.getSelection) {
        sel = window.getSelection()
        if (sel.getRangeAt && sel.rangeCount) {
          range = sel.getRangeAt(0)
          range.deleteContents()
          var el = document.createElement("span")
          el.innerHTML = parseEmoji(html)
          var frag = document.createDocumentFragment()
          var nodeVM
          let lastNode;
          while (nodeVM = el.firstChild) {
            lastNode = frag.appendChild(nodeVM);
          }
          range.insertNode(frag);
          if (lastNode) {
            range = range.cloneRange();
            range.setStartAfter(lastNode);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          };
        };
      }
    },
    clearInput() {
      const el = this.$refs.textarea
      el.innerHTML = ''
      this.curContent = ''
    },
    //监听按键操作
    enterFun (event) {
      event.preventDefault() // 阻止浏览器默认换行操作
      const value = decodeEmoji(event.target.innerHTML)
      console.log(value)
      if (!value) return false
      const msgData = {
        type: 1,
        toUid: this.newUser.uid,
        content: {
          content: value
        }
      }
      this.$emit('homesend', msgData)
      this.clearInput()
      return false
    },

    ctrlOrMetaEnter() {
      this.textareaRange()
    },
    cancelUpload(msg) {
      this.$refs.uploaders.cancelUp(msg.fileId, msg.uploadId)
      this.uploadCancel(msg)
    },
	}
}
