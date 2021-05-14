import { ref, computed, watch, reactive, toRefs } from 'vue'
import EmojiFace from 'components/emojiFace'
import RangeUtil from 'components/emojiFace/rangeUtil'
import UploadFile from 'components/common/UploadFile.vue'
import { getEmojiImgSrc, parseEmoji, decodeEmoji, keepLastIndex } from 'utils/common'
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
          this.$emit('on-input', this.curContent)
          $input.focus()
        } catch (e) {
          /* eslint-disable no-console */
          console.error(e)
        }
      })
    },
    // 换行并重新定位光标位置
    textareaRange() {
      console.log('????')
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
    pasteHandle(e) {
      let data = (e.clipboardData || window.clipboardData)
      if (!data && !data.items) {
        return false
      }
      // const fileItem = data.files[0]
      // const item = data.items[0]
      // const host = location.origin
      // const sy = `<img src="${host}/emoji/`
      // if (fileItem) {
      //   if (checkCutImg(this.$refs.textarea.innerHTML)) {
      //     this.$notify.open('warning', '暂时不支持粘贴多张图片哦')
      //     return false
      //   }
      //   const file = fileItem
      //   const {img, id} = await imgFileGetImg(file)
      //   const $input = this.$refs.textarea
      //   $input.focus()
      //   if (this.selection) {
      //     RangeUtil.restoreSelection(this.selection)
      //   }
      //   this.$nextTick(() => {
      //     try {
      //       this.cutImgObj[this.chattingUser.uid] = {
      //         file: file,
      //         id: id
      //       }
      //       this.$store.dispatch('setPasteImgObj', this.cutImgObj)
      //       RangeUtil.replaceSelection(img)
      //       this.content = decodeEmoji($input.innerHTML)
      //       this.setDftxt(this.content)
      //       this.$emit('on-input', this.content)
      //       $input.focus()
      //       this.pasteContentChange()
      //     } catch (e) {
      //       /* eslint-disable no-console */
      //       console.error(e)
      //     }
      //   })
      //   return false
      // } else if (item && item.kind === 'string') {
      //   item.getAsString(str => {
      //     if (str.indexOf(sy) >= 0) {
      //       return false
      //     }
      //     // str 是获取到的字符串
      //     const $input = this.$refs.textarea
      //     this.pasteHtmlAtCaret(str)
      //     this.content = decodeEmoji($input.innerHTML)
      //     this.setDftxt(this.content)
      //     this.$emit('on-input', this.content)
      //     this.pasteContentChange()
      //   })
      // } else if (fileItem || (item.kind === 'file' && item.type.indexOf('image/') !== -1)) {
      //   if (checkCutImg(this.$refs.textarea.innerHTML)) {
      //     this.$notify.open('warning', '暂时不支持粘贴多张图片哦')
      //     return false
      //   }
      //   const file = item.getAsFile()
      //   const {img, id} = await imgFileGetImg(file)
      //   const $input = this.$refs.textarea
      //   $input.focus()
      //   if (this.selection) {
      //     RangeUtil.restoreSelection(this.selection)
      //   }
      //   this.$nextTick(() => {
      //     try {
      //       this.cutImgObj[this.chattingUser.uid] = {
      //         file: file,
      //         id: id
      //       }
      //       this.$store.dispatch('setPasteImgObj', this.cutImgObj)
      //       RangeUtil.replaceSelection(img)
      //       this.content = decodeEmoji($input.innerHTML)
      //       this.setDftxt(this.content)
      //       this.$emit('on-input', this.content)
      //       $input.focus()
      //       this.pasteContentChange()
      //     } catch (e) {
      //       /* eslint-disable no-console */
      //       console.error(e)
      //     }
      //   })
      // } else {
      //   return false
      // }
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
