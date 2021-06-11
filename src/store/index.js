import { createStore } from 'vuex'
import * as storage from 'utils/storage'
import { updateBadge } from '@/winset'
import db from '../db'

export default createStore({
  state: {
    loginData: storage.ssGet('login_data'),
    notifyData: {},
    contactsTime: storage.ssGet('contacts_time'),
    contactsShowUser: storage.ssGet('contacts_show_user'),
    chattingUser: storage.ssGet('chat_ing_user'),
    dbMessageData: {},
    readyText: {},
    ossClient: storage.ssGet('ossClient'),
    newFriendNum: storage.lcGet('new_friend_num') || 0,
    newMessageNum: 0,
  },
  mutations: {
    'setLoginData'(state, info) {
      state.loginData = info
      storage.ssSet('login_data', info)
    },
    'setNotify'(state, obj) {
      state.notifyData = obj
      if (obj.time !== 'stay') {
        setTimeout(() => {
          state.notifyData = {}
        }, obj.time || 3000)
      }
    },
    'setContactsTime'(state, timestr) {
      state.contactsTime = timestr
      storage.ssSet('contacts_time', timestr)
    },
    'setContactsShowUser'(state, user) {
      state.contactsShowUser = user
      storage.ssSet('contacts_show_user', user)
    },
    'setChatUser'(state, user) {
      state.chattingUser = user
      storage.ssSet('chat_ing_user', user)
    },
    'setDBMessageData'(state, obj) {
      state.dbMessageData = obj
    },
    'setOssClient'(state, info) {
      state.ossClient = info
      storage.ssSet('oss_client', info)
    },
    async 'clearData'(state) {
      state.loginData = null
      state.contactsShowUser = null
      state.chattingUser = null
      state.contactsTime = null
      sessionStorage.clear()
      db.userDB.close()
      db.msgDB.close()
    },
    'setNewFriendNum'(state, num) {
      state.newFriendNum = num
      storage.lcSet('new_friend_num', num)
    },
    'setReadyTextObj'(state, obj) {
      state.readyText = obj
    },
    'setNewMessageNum'(state, num) {
      state.newMessageNum = num
    },
  },
  actions: {
    setLoginData({ commit }, info) {
      commit('setLoginData', info)
    },
    setNotify({ commit }, obj) {
      commit('setNotify', obj)
    },
    setContactsTime({ commit }, timestr) {
      commit('setContactsTime', timestr)
    },
    setContactsShowUser({ commit }, user) {
      commit('setContactsShowUser', user)
    },
    setChatUser({ commit }, user) {
      commit('setChatUser', user)
    },
    setDBMessageData({ commit }, listObj) {
      let msgNum = 0
      Object.keys(listObj).forEach((key) => {
        const oneNum = listObj[key].filter(o => o.read === false)
        msgNum += oneNum.length
      })
      updateBadge(msgNum)
      commit('setNewMessageNum', msgNum)
      commit('setDBMessageData', listObj)
    },
    setOssClient({ commit }, data) {
      commit('setOssClient', data)
    },
    setClearData({ commit }) {
      commit('clearData')
    },
    setNewFriendNum({ commit }, info) {
      commit('setNewFriendNum', info)
    },
    setReadyTextObj({ commit }, obj) {
      commit('setReadyTextObj', obj)
    },
  }
  // modules: {
  // }
})
