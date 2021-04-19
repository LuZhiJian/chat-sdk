import constant from 'utils/constant'
import store from '@/store'
/**
 * 获取 url 上的单个参数
 * @param {*} variable 参数名
 */
export const getUrlParam = function (variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return (false);
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
          objClone[key] = deepClone1(obj[key]);
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

export const resetTime = (time) => {
  const loginData = store.state.loginData
  const dfTime = (loginData && loginData.systemTime) || 0
  const finalTime = time - dfTime
  return finalTime
}
