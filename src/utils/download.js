import { FileDaesBuffer } from './common'
import creatFile from './creatFile'

const insetMsgList = (data) => {

}

var xhr = new XMLHttpRequest()
const loadFile = (fileInfo, callback) => {
  if (!fileInfo) {
    xhr.abort()
    callback()
    return false
  }

  xhr.open('GET', fileInfo.fileUrl || fileInfo.content.url, true)
  xhr.setRequestHeader("Content-type", "multipart/form-data")
  // xhr.onreadystatechange = (e) => {
  //   if (xhr.status !== 200) {
  //     // 失败
  //     callback({
  //       loadProgress: 100,
  //       xhr: xhr,
  //       locUrl: '',
  //       fail: true,
  //       percent: 100
  //     })
  //     return false
  //   }
  // }
  xhr.responseType = "arraybuffer"
  xhr.onprogress = (event) => {
    if (event.lengthComputable) {
      if (fileInfo.download) {
        // console.log(fileInfo)
        const backData = {
          loadsize: event.loaded,
          xhr: xhr,
          locUrl: '',
          finish: false,
          percent: (event.loaded/event.total * 100).toFixed(0)
        }
        callback(backData)
        // insetMsgList(Object.assign(fileInfo, backData))
      }
    }
  }
  xhr.onload = async (oEvent) => {
    // console.log(oEvent)
    // console.log(xhr.status)
    // console.log(xhr.response)
    if (xhr.readyState === 4 && xhr.status === 200) {
        // const splitSize = fileInfo.source === 0 ? (100 * 1024 + 28) : (100 * 1024 + 16)
      if (fileInfo.type === 7) {
        const backData1 = {
          loadsize: oEvent.loaded,
          xhr: null,
          locUrl: '',
          daesing: true,
          finish: false,
          percent: fileInfo.download ? 0 : 100
        }
        callback(backData1)
        insetMsgList(Object.assign(fileInfo, backData1))
      } else if (fileInfo.type === 3) {
        const backData2 = {
          loadsize: oEvent.loaded,
          xhr: null,
          locUrl: '',
          finish: false,
          percent: 99
        }
        callback(backData2)
        insetMsgList(Object.assign(fileInfo, backData2))
      }
      const buf = xhr.response
      const splitSize = (100 * 1024 + 16)
      const daesFile = await FileDaesBuffer(buf, splitSize, fileInfo.name, fileInfo.chatUid)
      console.log(daesFile)
      const isPic = [2, 6].includes(fileInfo.type)
      if (daesFile.filePath) {
        const backData = {
          loadsize: oEvent.loaded,
          xhr: null,
          locUrl: daesFile.filePath,
          daesing: false,
          finish: true,
          percent: isPic ? 100 : (fileInfo.download ? 0 : 100)
        }
        callback(backData)
        // insetMsgList(Object.assign(fileInfo, backData))
      } else {
        creatFile.creatDAESfile(new Uint8Array(daesFile.arraybuffer), daesFile.filename, (file) => {
          const backData = {
            loadsize: oEvent.loaded,
            xhr: null,
            locUrl: file,
            daesing: false,
            finish: true,
            percent: isPic ? 100 : (fileInfo.download ? 0 : 100)
          }
          callback(backData)
          insetMsgList(Object.assign(fileInfo, backData))
        })
      }
    } else {
      console.log('失败')
      const backData = {
        loadsize: 0,
        xhr: xhr,
        locUrl: '',
        fail: true,
        finish: true,
        percent: 100
      }
      callback(backData)
      insetMsgList(Object.assign(fileInfo, backData))
    }
  }
  xhr.send()
}

export default loadFile
