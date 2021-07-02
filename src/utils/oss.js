import OSS from 'ali-oss'
import { deepClone, resetTime } from 'utils/common'
import api from 'utils/api'
import store from '../store'

let ossClient
const client = async (type, file, size, progressFun, sucFun, errFun) => {
  // type 附件类型：2.图片，3.音频，4.视频，5.gif动图，7.文件
  const onlineFile = await api.getUploadUrl({param: {
    spaceType: 2,
    attachType: type
  }})
  let data = store.state.ossClient
  const nowTimeKey = resetTime(new Date().getTime())
  if (data) {
    if (nowTimeKey >= data.expiration || !data.securityToken) {
      try {
        data = await api.getOSSToken()
      } catch (error) {
        errFun(error)
        return false
      }
      store.dispatch('setOssClient', data)
    }
  } else {
    try {
      data = await api.getOSSToken()
    } catch (error) {
      errFun(error)
      return false
    }
    store.dispatch('setOssClient', data)
  }
  if (!data.securityToken) {
    alert('获取token失败')
    return false
  }
  ossClient = new OSS({
    endpoint: data.ossEndpoint,  //oss-cn-shenzhen.aliyuncs.com
    accessKeyId: data.accessKeyId,
    accessKeySecret: data.accessKeySecret,
    bucket: data.ossBucket,
    stsToken: data.securityToken
  })
  const copyOnlineFile = deepClone(onlineFile)
  const ossName = size > 1024 * 100 ? 'multipartUpload' : 'put'
  ossClient[ossName](copyOnlineFile.fileId, file, {
    progress: (percentage, pct) => {
      const percent = (percentage * 100).toFixed(0)
      // console.log(pct)
      if (pct) {
        progressFun(Object.assign(copyOnlineFile, {progress: Number(percent), uploadId: pct.uploadId}))
      }
    }
  }).then(res => {
    sucFun(onlineFile)
  }).catch(err => {
    console.log(err)
    errFun(err)
  })
}

const cancelUpload = async (name, id) => {
  await ossClient.abortMultipartUpload(name, id)
}

export default { client, cancelUpload}
