import constant from 'utils/constant'
import store from '@/store'
import creatFile from './creatFile'

import emojiJson from 'components/emojiFace/emoji.json'
import iconTxt from 'assets/filetype/icon-txt.png'
import iconApk from 'assets/filetype/icon-apk.png'
import iconAudio from 'assets/filetype/icon-audio.png'
import iconImg from 'assets/filetype/icon-img.png'
import iconPdf from 'assets/filetype/icon-pdf.png'
import iconPpt from 'assets/filetype/icon-ppt.png'
import iconVideo from 'assets/filetype/icon-video.png'
import iconWord from 'assets/filetype/icon-word.png'
import iconXls from 'assets/filetype/icon-xls.png'
import iconZip from 'assets/filetype/icon-zip.png'
import iconRar from 'assets/filetype/icon-rar.png'
import iconUnknown from 'assets/filetype/icon-unknown.png'
import SWorker from 'worker-loader!./worker.js'

const escapeRegExp = str => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1')

export const timeTalkFilter = timestamp => {
  // 补全为13位
  let arrTimestamp = (timestamp + '').split('');
  for (var start = 0; start < 13; start++) {
      if (!arrTimestamp[start]) {
          arrTimestamp[start] = '0';
      }
  }
  timestamp = arrTimestamp.join('') * 1;

  var minute = 1000 * 60;
  var hour = minute * 60;
  var day = hour * 24;
  var halfamonth = day * 15;
  var now = resetTime(new Date().getTime());
  var diffValue = now - timestamp;
  var weekTime = '';
  switch(new Date(timestamp).getDay()){
    case 0:
      weekTime = '周天';
      break;
    case 1:
      weekTime = '周一';
      break;
    case 2:
      weekTime = '周二';
      break;
    case 3:
      weekTime = '周三';
      break;
    case 4:
      weekTime = '周四';
      break;
    case 5:
      weekTime = '周五';
      break;
    case 5:
      weekTime = '周六';
      break;
  }
  // 如果本地时间反而小于变量时间
  // if (diffValue < 0) {
  //     return '不久前';
  // }

  // 数值补0方法
  var zero = function (value) {
    if (value < 10) {
        return '0' + value;
    }
    return value;
  };

  // 计算差异时间的量级
  var weekC = diffValue / (7 * day);
  var dayC = diffValue / day;
  var hourC = diffValue / hour;
  var minC = diffValue / minute;
  var T = new Date(timestamp),
  Result = zero(T.getHours()) + ':' + zero(T.getMinutes());
  // 使用
  if (weekC >= 1) {
      var date = new Date(timestamp);
      return `${dayjs(date).format('YY')}/${zero(date.getMonth() + 1)}/${zero(date.getDate())}`
  } else if (dayC > 3) {
      return weekTime;
  } else if (hourC > (24+new Date().getHours())) {
      return "前天";
  } else if (hourC > new Date().getHours()) {
      return "昨天";
  } else if (minC >= 1) {
      return Result;
  }
  return Result;
}

/**
 * base64位图片转码文件流
 */
export const base64toFile = function (dataurl, filename = 'file') {
  let arr = dataurl.split(',')
  let mime = arr[0].match(/:(.*?);/)[1]
  let suffix = mime.split('/')[1]
  let bstr = atob(arr[1])
  let n = bstr.length
  let u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], `${filename}.${suffix}`, {
    type: mime
  })
}
/**
 * 文件流转为 base64
 * @param {*} file
 */
export const fileToBase64 = function (file) {
  var URL = window.URL || window.webkitURL;
  return URL.createObjectURL(file);
}
/**
 * 关闭页面监听
 * @param callback 回调方法
 */
export const closePageListener = function (callback) {
  let isClose = false
  window.onbeforeunload = function () {
    execute()
  }
  window.onunload = function () {
    execute()
  }

  function execute() {
    if (isClose) {
      return
    }
    isClose = true
    callback()
  }
}

// 深拷贝（json 方式，无法拷贝对象中方法）
export const deepClone = function (obj) {
  var objClone = Array.isArray(obj) ? [] : {};
  //进行深拷贝的不能为空，并且是对象或者是
  if (obj && typeof obj === "object") {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (obj[key] && typeof obj[key] === "object") {
          objClone[key] = deepClone(obj[key])
        } else {
          objClone[key] = obj[key];
        }
      }
    }
  }
  return objClone
}

let timer = null
export const Toast = function(type, txt, time) {
  if (timer) {
    $('#tnt-alert').remove()
    clearTimeout(timer)
    timer = null
  }
  const mytime = time || 3000
  const html = `<div id="tnt-alert" class="alert ${type}">${txt}</div>`
  $('body').prepend(html)

  timer = setTimeout(function(){
    $('#tnt-alert').remove()
    clearTimeout(timer)
    timer = null
  }, mytime)
}

// 格式化系统时间
export const resetTime = (time) => {
  const loginData = store.state.loginData
  const dfTime = (loginData && loginData.systemTime) || 0
  const finalTime = time - dfTime
  return finalTime
}

// 聊天定位到底部
export const goBottom = () => {
  setTimeout(() => {
    let ele = document.getElementById('message-scroll')
    ele.scrollTop = ele && ele.scrollHeight
  }, 10)
}

// 转义
export const HTMLEncode = str => {
  var s = "";
  if (str.length == 0) return "";
  s = str.replace(/&/g, "&amp;");
  s = s.replace(/</g, "&lt;");
  s = s.replace(/>/g, "&gt;");
  s = s.replace(/ /g, "&nbsp;");
  s = s.replace(/\'/g, "&#39;");
  s = s.replace(/\"/g, "&quot;");
  // s = s.replace(/\n/g, "<br/>");
  return s;
}

// 反转义
export const HTMLDecode = str => {
  var s = "";
  if (str.length == 0) return "";
  s = str.replace(/&amp;/g, "&");
  s = s.replace(/&lt;/g, "<");
  s = s.replace(/&gt;/g, ">");
  s = s.replace(/&nbsp;/g, " ");
  s = s.replace(/&#39;/g, "\'");
  s = s.replace(/&quot;/g, "\"");
  s = s.replace(/<br\/>/g, "\n");
  return s;
}

export const parseEmoji = val => {
  val = val || ''
  Object.keys(emojiJson).forEach(v => {
    val = val.replace(new RegExp(escapeRegExp(v), 'g'),
      `<img src="${emojiJson[v]}" alt="${v}">`)
  })
  return val
}

export const decodeEmoji = (val) => {
  let value = HTMLDecode(val || '')
  Object.keys(emojiJson).forEach(v => {
    value = value.replace(new RegExp(escapeRegExp(`<img src="${emojiJson[v]}" alt="${v}">`), 'g'), v)
  })
  // value = value.replace(/<br\s*\/?>/gi, '\n').replace(/&nbsp;/g, ' ')
  // value = value.replace(/<(?!\/?br\/?.+?>|\/?img.+?>)[^<>]*>/gi, '')
  return value
}

export const parseEmojiShowCode = val => {
  val = HTMLEncode(val || '')
  Object.keys(emojiJson).forEach(v => {
    val = val.replace(new RegExp(escapeRegExp(v), 'g'),
      `<img src="${emojiJson[v]}" alt="${v}">`)
  })
  return val
}

export const getEmojiImgSrc = val => {
  Object.keys(emojiJson).forEach(v => {
    val = val.replace(new RegExp(escapeRegExp(v), 'g'),
      emojiJson[v])
  })
  return val
}

export const matchType = fileName => {
  // 后缀获取
  var suffix = ''
  try {
    var flieArr = fileName.split('.')
    suffix = flieArr[flieArr.length - 1].toLowerCase()
  } catch (err) {
    suffix = ''
  }
  // 获取类型结果
  let type = null,
    icon = iconUnknown
  switch (suffix) {
    case 'jpeg':
    case 'jpg':
    case 'bmp':
    case 'dds':
    case 'png':
    case 'pspimage':
    case 'tga':
    case 'thm':
    case 'tif':
    case 'tiff':
    case 'yuv':
      type = 2
      icon = iconImg
      break;
    case 'aif':
    case 'iff':
    case 'm3u':
    case 'm4a':
    case 'mid':
    case 'mp3':
    case 'mpa':
    case 'wav':
    case 'wma':
      type = 3
      icon = iconAudio
      break;
    case 'mp4':
    case 'mkv':
    case 'mov':
    case 'mpg':
    case 'mpeg':
    case '3gp':
    case '3gpp':
    case '3g2':
    case '3gpp2':
    case 'webm':
    case 'ts':
    case 'avi':
    case 'flv':
    case 'swf':
    case 'wmv':
    case 'vob':
    case 'm4v':
      type = 4
      icon = iconVideo
      break;
    case 'gif':
      type = 6
      icon = iconImg
      break;
    case 'doc':
    case 'docx':
    case 'odt':
    case 'pages':
    case 'rtf':
    case 'tex':
    case 'wpd':
    case 'wps':
      type = 7
      icon = iconWord
      break;
    case 'xlsx':
    case 'xlx':
    case 'xls':
      type = 7
      icon = iconXls
      break;
    case 'ppt':
    case 'pptx':
      type = 7
      icon = iconPpt
      break;
    case 'idnn':
    case 'pct':
    case 'pdf':
      type = 7
      icon = iconPdf
      break;
    case 'zip':
    case 'arj':
    case 'tar.gz':
    case 'tgz':
    case 'gz':
    case 'iso':
    case 'tbz':
    case 'tbz2':
    case '7z':
    case 'jar':
      type = 7
      icon = iconZip
      break;
    case 'rar':
      type = 7
      icon = iconRar
      break;
    case 'log':
    case 'txt':
    case 'msg':
      type = 7
      icon = iconTxt
      break;
    case 'apk':
      type = 7
      icon = iconApk
      break;

    default:
      type = 7
      icon = iconUnknown
      break;
  }

  return {
    type: type,
    icon: icon,
    suffix: suffix
  }
}

export const vagueSearchList = (getlist, str) => {
  const list = deepClone(getlist)
  let filterList = list.filter(item => item.userInfo.nickName.toLowerCase().indexOf(str.toLowerCase()) !== -1)
  var reg = new RegExp(str, "gi")
  filterList.forEach(v => {
    v.userInfo.showName = v.userInfo.nickName.replace(reg, (txt) => {
      return "<i>"+txt+"</i>";
    })
  })
  return filterList
}

export const keepLastIndex = obj => {
  // obj 为可编辑 的div  移动端的就没做低版本的兼容
  if (window.getSelection) {
    let range = window.getSelection()// 创建range
    range.selectAllChildren(obj)// range 选择obj下所有子内容
    range.collapseToEnd()// 光标移至最后
  }
}

export const checkFile = file => {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = (e) => {
      // 文件
      resolve(true)
    }
    reader.onerror = (e) => {
      // 文件夹
      resolve(false)
    }
    reader.readAsText(file)
  })
}

export const checkFileIn = async (url) => {
  const isIn = await creatFile.checkFileIn(url)
  return isIn
}

export const intervalTime = (time) => {
  const timestamp = new Date().getTime()
  const date = (timestamp - time).toFixed(0)
  const days = Math.floor(date / (24 * 3600 * 1000))
  return days
}

export const inTime = (getApiTime) => {
  const nowTiming = new Date().getTime()
  const csTime = Math.abs(nowTiming - (getApiTime || 0))/1000/60
  return csTime
}

export const FileAesBuffer = (arraybuf, size, filename) => {
  return new Promise(resolve => {
    let worker = new SWorker()
    worker.postMessage({arraybuf, size, isDaes: false})
    worker.onmessage = e => {
      worker.terminate()
      resolve(e.data)
    }
    worker.onerror = e => {
      console.log('webwork error')
    }
  })
}

export const FileDaesBuffer = (arraybuf, size, filename, chatUid) => {
  return new Promise(resolve => {
    let worker = new SWorker()
    worker.postMessage({arraybuf, filename, size, isDaes: true, chatUid})
    worker.onmessage = e => {
      worker.terminate()
      creatFile.creatDAESfile(new Uint8Array(e.data.arraybuffer), e.data.filename, e.data.chatUid, (file) => {
        resolve({
          filePath: file
        })
      })
    }
    worker.onerror = e => {
      console.log('webwork error')
    }
  })
}
