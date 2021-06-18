import { ref, computed, watch, reactive, toRefs } from 'vue'
import EmojiFace from 'components/emojiFace'
import RangeUtil from 'components/emojiFace/rangeUtil'
import UploadFile from 'components/common/UploadFile.vue'
import { deepClone, HTMLEncode, getEmojiImgSrc, parseEmoji, decodeEmoji, keepLastIndex, checkFile, matchType, checkCutImg, imgFileGetImg, decodeCutImg } from 'utils/common'
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
      trueContent: '',
      cutImgObj: {}
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
          this.setInputReadyTxt(decodeEmoji(this.trueContent))
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
    getFocus() {
      this.$nextTick(() => {
        this.$refs.textarea.focus()
      })
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
    setInputReadyTxt(val) {
      // 存入草稿
      if (!this.chatUser) return
      const txtObj = this.$store.state.readyText
      const user = this.chatUser
      txtObj[user.uid] = val
      this.$store.dispatch('setReadyTextObj', txtObj)
    },
    inputHandle(event) {
      const value = event.target.innerHTML
      this.trueContent = value.replace(/(^\s*)|(\s*$)/g, "")
      this.setInputReadyTxt(decodeEmoji(value))
    },
    async dragHandle(e) {
      // console.log(e)
      const file = e.dataTransfer.files[0]
      if (!file) return false
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
    async pasteHandle(e) {
      let data = (e.clipboardData || window.clipboardData)
      if (!data && !data.items) {
        return false
      }
      const item = data.items[0]
      const fileItem = data.files[0]
      if (fileItem) {
        if (checkCutImg(this.$refs.textarea.innerHTML)) {
          this.$notify.open('warning', '暂时不支持粘贴多张图片哦')
          return false
        }
        const file = fileItem
        const {img, id} = await imgFileGetImg(file)
        const $input = this.$refs.textarea
        $input.focus()
        if (this.selection) {
          RangeUtil.restoreSelection(this.selection)
        }
        this.$nextTick(() => {
          try {
            this.cutImgObj[this.chatUser.uid] = {
              file: file,
              id: id
            }
            this.$store.dispatch('setPasteImgObj', this.cutImgObj)
            RangeUtil.replaceSelection(img)
            const value = decodeEmoji(HTMLEncode($input.innerHTML))
            this.setInputReadyTxt(value)
            this.trueContent = value.replace(/(^\s*)|(\s*$)/g, "")
            $input.focus()
          } catch (e) {
            /* eslint-disable no-console */
            console.error(e)
          }
        })
        return false
      } else if (item && item.kind === 'string') {
        item.getAsString(str => {
          // str 是获取到的字符串
          const $input = this.$refs.textarea
          const en_str = HTMLEncode(str)
          this.pasteHtmlAtCaret(en_str)
          const value = decodeEmoji($input.innerHTML)
          this.setInputReadyTxt(value)
          this.trueContent = value.replace(/(^\s*)|(\s*$)/g, "")
        })
      }else if (fileItem || (item.kind === 'file' && item.type.indexOf('image/') !== -1)) {
        if (checkCutImg(this.$refs.textarea.innerHTML)) {
          this.$notify.open('warning', '暂时不支持粘贴多张图片哦')
          return false
        }
        const file = item.getAsFile()
        const {img, id} = await imgFileGetImg(file)
        const $input = this.$refs.textarea
        $input.focus()
        if (this.selection) {
          RangeUtil.restoreSelection(this.selection)
        }
        this.$nextTick(() => {
          try {
            this.cutImgObj[this.chatUser.uid] = {
              file: file,
              id: id
            }
            this.$store.dispatch('setPasteImgObj', this.cutImgObj)
            RangeUtil.replaceSelection(img)
            const value = decodeEmoji(HTMLEncode($input.innerHTML))
            this.setInputReadyTxt(value)
            this.trueContent = value.replace(/(^\s*)|(\s*$)/g, "")
            $input.focus()
          } catch (e) {
            /* eslint-disable no-console */
            console.error(e)
          }
        })
      } else {
        return false
      }
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
      this.trueContent = ''
    },
    clearReadyTxt() {
      const txtObj = deepClone(this.$store.state.readyText)
      txtObj[this.newUser.uid] = ''
      this.$store.dispatch('setReadyTextObj', txtObj)
    },
    //监听按键操作
    enterFun (event) {
      event.preventDefault() // 阻止浏览器默认换行操作
      const el = this.$refs.textarea
      const value = decodeEmoji(el.innerHTML)
      const cutImgObj = this.$store.state.pasteImgObj[this.newUser.uid]
      if (!value) return false
      if (cutImgObj) {
        const contentList = decodeCutImg(value, cutImgObj)
        if (!checkCutImg(value)) {
          contentList.map(o => {
            o.value = o.type === 'file' ? '' : o.value
          })
        }
        this.next(0, contentList, () => {});
      } else {
        const msgData = {
          type: 1,
          toUid: this.newUser.uid,
          content: {
            content: value
          }
        }
        this.$emit('homesend', msgData)
      }
      this.clearInput()
      this.clearReadyTxt()
      return false
    },

    //图片文本消息同步递归处理
    async next(i, list, callback){
      if(i < list.length){
        if (list[i].type === 'file') {
          if (!list[i].value){
            this.next(++i, list, callback)
          }else{
            await this.$refs.uploaders.uploadingFun(list[i].value)
          }
        } else {
          if(list[i].value) {
            const msgData = {
              type: 1,
              toUid: this.newUser.uid,
              content: {
                content: list[i].value.replace(/\@[^\s]+\s/ig, function(v) {return v.replace(/\s/ig, String.fromCharCode(8197))})
              }
            }
            this.$emit('homesend', msgData)
          }
        }
        this.next(++i, list, callback)
      }
    },

    setReadyTextToInput(text) {
      if (!text) return false
      const result = checkCutImg(text) ? text : HTMLEncode(text)
      this.pasteHtmlAtCaret(result)
    },

    ctrlOrMetaEnter() {
      this.textareaRange()
    },
    cancelUpload(msg) {
      this.$refs.uploaders.cancelUp(msg.fileId, msg.uploadId)
      this.uploadCancel(msg)
    },
    onChatUserChange(user) {
      if (!user) return false
      const txtObj = deepClone(this.$store.state.readyText)
      const text = txtObj[user.uid]
      this.setReadyTextToInput(text)
    }
	},
  watch: {
    chatUser: {
      handler: 'onChatUserChange',
      immediate: true,
      deep: true
    }
  },
  computed: {
    chatUser() {
      return deepClone(this.$store.state.chattingUser)
    }
  }
}
