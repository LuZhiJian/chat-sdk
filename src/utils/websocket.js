import store from '../store'
import constant from './constant'
import dayjs from 'dayjs'
import Cat from './wsHander'

const loginData = store.state.loginData || {}

const socket = {
  websock: null,
  // 如需使用动态WebSocket地址，请自行作ajax通讯后扩展
  ws_url: (loginData.urlInfo && loginData.urlInfo.sessionUrl) || constant.wsUrl,
  // 开启标识
  socket_open: false,
  // 心跳timer
  hearbeat_timer: null,
  // 心跳发送频率
  hearbeat_interval: 10000,
  // socket标签
  socket_tag: 0,
  // 是否自动重连
  is_reonnect: true,
  // 重连次数
  reconnect_count: 7,
  // 已发起重连次数
  reconnect_current: 1,
  // 重连timer
  reconnect_timer: null,
  // 重连频率
  reconnect_interval: 10000,
  // 当前连接的socket_url
  current_sw_url: '',

  /**
   * 初始化连接
   */
  init: () => {
    if (!("WebSocket" in window)) {
      console.log('浏览器不支持WebSocket')
      return null
    }

    // 已经创建过连接不再重复创建
    if (socket.websock) {
      return socket.websock
    }
    socket.socket_tag++
    const wsuri = `${socket.ws_url}/?sid=${socket.socket_tag}`
    socket.current_sw_url = wsuri
    socket.websock = new WebSocket(wsuri)
    socket.websock.onmessage = (e) => {
      if (socket.current_sw_url !== e.target.url) {
        console.log('onmessage: wsurl不一样')
        return false
      } else {
        const result = event.data
        socket.receive(result)
      }
    }

    // 关闭连接
    socket.websock.onclose = (e) => {
      console.log('连接已断开')
      console.log('connection closed (' + e.code + ')')
      clearInterval(socket.hearbeat_interval)
      socket.socket_open = false

      // 需要重新连接
      if (socket.is_reonnect) {
        socket.reconnect_timer = setTimeout(() => {
          // 超过重连次数
          if (socket.reconnect_current > socket.reconnect_count) {
            clearTimeout(socket.reconnect_timer)
            return
          }

          // 记录重连次数
          socket.reconnect_current++
          socket.reconnect()
        }, socket.reconnect_interval)
      }
    }

    // 连接成功
    socket.websock.onopen = (e) => {
      if (socket.current_sw_url !== e.target.url) {
        console.log('onmessage: wsurl不一样')
        return false
      }
      console.log('连接成功')
      socket.socket_open = true
      socket.is_reonnect = true
      socket.heartbeat()
      // 登录socket
      socket.send(0, {})
    }

    // 连接发生错误
    socket.websock.onerror = (e) => {
      console.log('WebSocket连接发生错误')
      if (socket.current_sw_url !== e.target.url) {
        console.log('onmessage: wsurl不一样')
        return false
      }
      socket.reconnect()
    }
  },

  /**
   * 发送消息
   * @param {*} data 发送数据
   * @param {*} callback 发送后的自定义回调函数
   */
  send: async (type = 0, data, callback = null) => {
    // 开启状态直接发送
    if (socket.websock && socket.websock.readyState === socket.websock.OPEN) {
      try {
        // 0: 登录 1: 心跳， 2: 私聊 发送, 3：发送已接收私聊消息回执, 4：发送撤回消息, 5：退出登录
        const sendType = [1000, 1001, 1002, 1003, 1004, 1005]
        const buf = await Cat.sendFun(sendType[type], data)
        socket.websock.send(buf)
      } catch (e) {
        console.log('报错')
      }

      // 正在开启状态，则等待1s后重新调用
    } else if (socket.websock.readyState === socket.websock.CONNECTING) {
      setTimeout(() => {
        socket.send(type, data, callback)
      }, 1000)

      // 未开启，则等待1s后重新调用
    } else {
      socket.init()
      setTimeout(() => {
        socket.send(type, data, callback)
      }, 1000)
    }
  },

  /**
   * 接收消息
   * @param {*} message 接收到的消息
   */
  receive: async (message) => {
    const smgContent = await Cat.receiveFun(message)
    // console.log(smgContent);
  },

  /**
   * 心跳
   */
  heartbeat: () => {
    console.log('socket', '滴滴~~')
    if (socket.hearbeat_timer) {
      clearInterval(socket.hearbeat_timer)
    }

    socket.hearbeat_timer = setInterval(() => {
      socket.send(1, {})
    }, socket.hearbeat_interval)
  },

  /**
   * 主动关闭连接
   */
  close: () => {
    console.log('主动断开连接')
    clearInterval(socket.hearbeat_interval)
    socket.is_reonnect = false
    socket.websock.close()
  },

  /**
   * 重新连接
   */
  reconnect: () => {
    console.log('发起重新连接', socket.reconnect_current)

    if (socket.websock && socket.socket_open) {
      socket.websock.close()
    }

    socket.init()
  },
}

// 导出socket对象
export default socket
