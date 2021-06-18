<template>
  <div class="upload">
    <slot>
      <span class="add"></span>
    </slot>
    <input name="upload" id="upload-input" type="file" accept="image/*, video/*, audio/*" class="file" @change="handleChange">
  </div>
</template>
<script>
import { watch, reactive, toRefs } from 'vue'
import { deepClone, matchType, resetTime, FileAesBuffer, FileDaesBuffer } from 'utils/common'
import lrz from 'lrz'
import oss from 'utils/oss'
import md5 from 'js-md5'
import creatfile from 'utils/creatFile'

// 图片按压缩
const lrzImg = (file) => {
  return new Promise(resolve => {
    try {
      const img = new Image
      var reader = new FileReader()
      reader.onloadend = () => {
        img.src = reader.result
        img.onload = (data) => {
          const largeSize = 1280
          const midSize = 640
          const maxRaido = 8

          let upWidth = img.width
          let upHeight = img.height

          if (img.width > midSize && img.height > midSize) {
            if (img.width / img.height > maxRaido || img.height / img.width > maxRaido) {
              let radio = Math.max(midSize / img.width, midSize / img.height)
              upWidth = radio * img.width
              upHeight = radio * img.height
            } else {
              if (img.width > largeSize && img.height >= largeSize) {
                let radio = Math.max(largeSize / img.width, largeSize / img.height)
                upWidth = radio * img.width
                upHeight = radio * img.height
              }
            }
          }

          const option = {
            width: upWidth,
            height: upHeight,
            quality: 0.9
          }
          lrz(file, option).then(rst => {
            //成功时执行
            resolve(rst)
          }).catch(error => {
            resolve(file)
            //失败时执行
          })
        }
      }
      reader.readAsDataURL(file)
    } catch (err) {
      resolve(file)
      console.log("err:", err);
    }
  })
}

    // 缩略图图片
const lrzThumbImg = (file) => {
  return new Promise(resolve => {
    try {
      const img = new Image
      var reader = new FileReader()
      reader.onloadend = () => {
        img.src = reader.result
        img.onload = (data) => {
          let upWidth = Math.min(img.width, 240)
          let upHeight = Math.min(img.height, 240)

          const option = {
            width: upWidth,
            height: upHeight,
            quality: 0.8
          }
          lrz(file, option).then(rst => {
            //成功时执行
            resolve(rst)
          }).catch(error => {
            resolve(file)
            //失败时执行
          })
        }
      }
      reader.readAsDataURL(file)
    } catch (err) {
      resolve(file)
      console.log("err:", err);
    }
  })
}

export default {
  data() {
    return {
      subscription: {}
    }
  },
  props: {
    uid: Number
  },
  setup(props, context) {
    let userObj = reactive({
      chatUid: null
    })
    watch(()=> props.uid, (newId, oldId)=>{
      userObj.chatUid = newId
    }, {
      deep: true,
      immediate: true
    })
    return {
      ...toRefs(userObj)
    }
  },
  created() {
  },
  methods: {
    validate(file) {
      if (!file) return;
      const size = file.size / 1024 / 1024
      if (size > 50) {
        this.$notify.open("error", "文件大小不能超过50M")
        return false
      } else if (this.$store.state.netState === 'offline') {
        this.$notify.open("error", '网络不可用！请检查您的网络')
        return false
      } else {
        return true
      }
    },

    handleChange(event) {
      const file = event.target.files[0]
      this.uploadingFun(file)
    },

    getImgToBase64(filedata, file, callback){
      let newfile = null
      switch (filedata.type) {
        case 2:
          newfile = new Image
          break;
        case 3:
          newfile = new Audio
          break;
        case 4:
          newfile = document.createElement('video')
          break;
        default:
          newfile = null
          break;
      }
      var reader = new FileReader()
      reader.onloadend = () => {
        callback(reader.result, newfile)
        if (newfile) {
          newfile.src = reader.result
        }
      }
      reader.readAsDataURL(file)
    },

    toAesFile(file, fileInfo) {
      return new Promise((resolve, reject) => {
        try {
          var reader = new FileReader()
          reader.readAsArrayBuffer(file) //转化二进制流，异步方法
          reader.onload = async (e) => {
            const arraybuf = reader.result
            const splitSize = 100 * 1024
            const filename = `${md5(new Date().getTime().toString())}.${fileInfo.suffix}`
            const aesBuffer = await FileAesBuffer(arraybuf, splitSize, filename)
            resolve(aesBuffer)
          }
        } catch (err) {
          reject(err)
          console.log("err:", err);
        }
      })
    },

    makeThumimg (file, filedata) {
      return new Promise(async (resolve, reject) => {
        try {
          const thumImg = await lrzThumbImg(file)
          let aesThumImg = await this.toAesFile(thumImg.file, filedata)
          var newblob = aesThumImg.uploadBlob
          //调用
          oss.client(filedata.type, newblob, file.size, ()=>{}, res => {
            resolve(res)
          }, (err)=>{
            console.log(err)
          })
        } catch (err) {
          reject(err)
          console.log("err:", err);
        }
      })
    },

    async uploadingFun(file) {
      if (!this.validate(file)) return false
      const filedata = matchType(file.name)
      const optFile = filedata.type === 2 ? (await lrzImg(file)).file : file
      // 清除file的文本框的文件信息清除
      const $input = document.getElementById('upload-input')
      $input.value = ''
      const thumimgdata = filedata.type === 2 ? await this.makeThumimg(file, filedata) : null
      this.getImgToBase64(filedata, file, async (dataUrl, newFile) => {
        const filePath = await creatfile.imFile(file, this.chatUid)
        let data = [2, 4, 5].includes(filedata.type) ? {
          key: file.name,
          fileType: filedata.type,
          suffix: filedata.suffix,
          icon: filedata.icon,
          size: file.size,
          url: filePath,
          content: {
            width: newFile.width,
            height: newFile.height,
            fileSize: file.size,
            url: filePath,
            thumbURL: filedata.type === 2 ? thumimgdata.url : ''
          },
          uid: this.chatUid
        } : {
          key: file.name,
          fileType: filedata.type,
          suffix: filedata.suffix,
          icon: filedata.icon,
          size: file.size,
          url: filePath,
          content: {
            fileSize: file.size,
            url: filePath
          },
          uid: this.chatUid
        }
        if ([3, 4].includes(filedata.type)) {
          data.content.duration = newFile.duration
          data.fileType = 7
        }
        const sign = new Date().getTime()
        data = Object.assign(data, {
          time: sign,
          flag: sign,
          toUid: this.chatUid
        })
        this.uploadFile(data, optFile, filedata)
      })
    },

    async uploadFile(data, optFile, filedata) {
      const that = this
      const oldData = deepClone(data)
      that.$emit('uploaddata', Object.assign(data, {ready: false, progress: 0}))
      const aesFileData = await this.toAesFile(optFile, filedata)
      const newblob = aesFileData.uploadBlob
      oss.client(data.fileType, newblob, data.size, (gressData) => {
        gressData.url = oldData.url
        that.$emit('progress', Object.assign(data, gressData))
      }, res => {
        const sendData = {...res, ...data}
        sendData.content.url = res.url
        sendData.url = oldData.url
        that.$emit('uploaded', sendData)
      }, err => {
        that.$emit('uploaderr', data)
      })
    },

    cancelUp(name, id) {
      if (!name) return
      oss.cancelUpload(name, id)
    }
  }
};
</script>


<style scoped>
.upload {
  width: 100%;
  height: 100%;
  position: relative;
}
.file {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  opacity: 0;
  cursor: pointer;
}
</style>
