import fs from 'fs'
import { remote } from 'electron'
import store from '../store'

let configDir = remote.app.getPath('userData')
let index = 0
const fileOption = { mode: 438 /*=0666*/ }

const mkdirPath = (pathStr) => {
  return new Promise(resolve => {
    var projectPath = pathStr
    if (fs.existsSync(projectPath)) {
      var tempstats = fs.statSync(projectPath)
      if (!(tempstats.isDirectory())) {
        fs.unlinkSync(projectPath)
        fs.mkdirSync(projectPath)
      }
    } else {
      fs.mkdirSync(projectPath)
    }
    resolve(projectPath)
  })
}

const checkFileNo = (locationNewPath, fileName, cb) => {
  const nameArr = fileName.split('.')
  const suffix = fileName.split('.')[nameArr.length - 1]
  let lolName = fileName.split(`.${suffix}`)[0]
  const checkFile = () => {
    const newFileFullPath = index > 0 ? `${locationNewPath}/${lolName}(${index}).${suffix}` : `${locationNewPath}/${fileName}`
    fs.access(newFileFullPath, (err) => {
      if (err && err.code == "ENOENT") {
        index = 0
        cb(newFileFullPath)
      } else {
        index++
        checkFile()
      }
    })
  }
  checkFile()
}

const creatDAESfile = async (buf, fileName, chatUid, cb) => {
  const loginData = store.state.loginData
  const sessionDir = loginData && loginData.userInfo && loginData.userInfo.uid
  const chatDir = chatUid
  await mkdirPath(`${configDir}/msgDir`)
  await mkdirPath(`${configDir}/msgDir/${sessionDir}`)
  await mkdirPath(`${configDir}/msgDir/${sessionDir}/${chatDir}`)
  const locationNewPath = `${configDir}/msgDir/${sessionDir}/${chatDir}`
  checkFileNo(locationNewPath, fileName, (url) => {
    fs.writeFile(url, buf, fileOption, (err) => {
      if (!err) {
        cb(url)
      } else {
        throw err
      }
    })
  })
}


const imFile = (file, chatUid) => {
  return new Promise(resolve => {
    var reader = new FileReader()
    reader.readAsArrayBuffer(file)
    reader.onload = async () => {
      const loginData = store.state.loginData
      const sessionDir = loginData && loginData.userInfo && loginData.userInfo.uid
      const chatDir = chatUid
      await mkdirPath(`${configDir}/msgDir`)
      await mkdirPath(`${configDir}/msgDir/${sessionDir}`)
      await mkdirPath(`${configDir}/msgDir/${sessionDir}/${chatDir}`)
      const locationNewPath = `${configDir}/msgDir/${sessionDir}/${chatDir}`
      const fileName = file.name
      const buf = new Uint8Array(reader.result)
      checkFileNo(locationNewPath, fileName, (url) => {
        fs.writeFile(url, buf, fileOption, (err) => {
          if (!err) {
            resolve(url)
          } else {
            throw err
          }
        })
      })
    }
  })
}

const deleteFile = (chatId) => {
  const loginData = store.state.loginData
  const sessionDir = loginData && loginData.sessionId
  const chatDir = chatUid
  let path = `${configDir}/msgDir/${sessionDir}/${chatDir}`

  // ??????????????????????????????????????????
  try {
    var list = fs.readdirSync(path)
    list.forEach((v, i) => {
      // ????????????
      var url = p + '/' + v
      // ??????????????????
      var stats = fs.statSync(url)
      // ??????????????????????????????
      if (stats.isFile()) {
        // ?????????????????????????????????
        fs.unlinkSync(url)
      } else {
        // ??????????????????????????????????????????
        arguments.callee(url)
      }
    })
    // ??????????????????
    fs.rmdirSync(p)
  } catch (e) {
    console.log(e);
  }
}

const deleteOneFile = (url) => {
  try {
    let stats = fs.statSync(url)
    // ??????????????????????????????
    if (stats.isFile()) {
      // ?????????????????????????????????
      fs.unlinkSync(url)
    }
  } catch (e) {
    // console.log(e);
  }
}

const deleteDir = async (path) => {
  let files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach((file, index) => {
      let curPath = path + "/" + file;
      if (fs.statSync(curPath).isDirectory()) {
        if (curPath) {
          deleteDir(curPath) //?????????????????????
        }
      } else {
        fs.unlinkSync(curPath) //????????????
      }
    })
    fs.rmdirSync(path)
  }
}

const checkFileIn = (url) => {
  return new Promise((resolve, reject) => {
    fs.access(url, (err) => {
      if (err && err.code == "ENOENT") {
        resolve(false)
      } else {
        resolve(true)
      }
    })
  })
}

export default {
  imFile,
  deleteFile,
  deleteOneFile,
  deleteDir,
  creatDAESfile,
  checkFileIn
}
