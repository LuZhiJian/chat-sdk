import { createStore } from 'vuex'
import * as storage from 'utils/storage'

export default createStore({
  state: {
    loginData: storage.lcGet('login_data'),
    notifyData: {},
    contactsTime: storage.lcGet('contacts_time'),
    contactsShowUser: storage.lcGet('contacts_show_user'),
    chattingUser: storage.lcGet('chat_ing_user'),
    dbMessageData: {},
    ossClient: storage.ssGet('ossClient')
  },
  mutations: {
    'setLoginData'(state, info) {
      state.loginData = info
      storage.lcSet('login_data', info)
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
      storage.lcSet('contacts_time', timestr)
    },
    'setContactsShowUser'(state, user) {
      state.contactsShowUser = user
      storage.lcSet('contacts_show_user', user)
    },
    'setChatUser'(state, user) {
      state.chattingUser = user
      storage.lcSet('chat_ing_user', user)
    },
    'setDBMessageData'(state, obj) {
      state.dbMessageData = obj
    },
    'setOssClient'(state, info) {
      state.ossClient = info
      storage.ssSet('oss_client', info)
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
      commit('setDBMessageData', listObj)
    },
    setOssClient({ commit }, data) {
      commit('setOssClient', data)
    },
  }
  // modules: {
  // }
})
