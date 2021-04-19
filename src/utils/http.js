import axios from 'axios'
import constant from './constant'
import store from '../store'
import { initByte, initJson } from './apiFormat'

const $notify = (type, msg, time) => {
  const obj = {
    type: type,
    msg: msg,
    time: time || 3000
  }
  console.log(obj)
  return store.dispatch('setNotify', obj)
}

const { baseUrl } = constant

axios.defaults.withCredentials = true

// http request 拦截器
axios.interceptors.request.use(
  (config) => config,
  (err) => Promise.reject(err),
)

axios.interceptors.response.use(
  (response) => {
    if (response && response.status === 200) {
      return response.data
    }
    console.log('response', response)
    // alert('status error: ' + response.status)
    return false
  },
  (error) => {
    console.log(error)
    return Promise.reject(error)
  },
)
const commonKey = constant.API_KEY

const post = async (url, data = {}) => {
  console.log('基本传参：', data)
  const loginData = store.state.loginData || {}
  const clientInfo = {
    sessionId: loginData.sessionId,
    plat: 3,
  }
  const { param } = data
  const dataString = JSON.stringify({
    clientInfo,
    param
  })
  const params = initByte(dataString, commonKey) // 加密后
  const urlData = loginData.urlInfo
  const bsurl = (urlData && urlData.bizUrl) || baseUrl
  return axios({
    method: 'post',
    baseURL: bsurl,
    url,
    responseType: 'blob',
    timeout: 30000,
    data: params,
    headers: {
      'Content-Type': 'application/json charset=utf-8',
    },
  }).then(async (res) => {
    const jsonData = await initJson(res, commonKey)
    if (jsonData.code === 200) {
      return jsonData.result || 200
    }
    return Promise.reject(jsonData)
  }).catch((err) => {
    $notify('error', err.msg)
    return Promise.reject(err)
  })
}

export default { post }
