import { createStore } from 'vuex'
import * as storage from 'utils/storage'
import db from '../db'

export default createStore({
  state: {
    loginData: storage.ssGet('login_data'),
    notifyData: {},
    contactsTime: storage.ssGet('contacts_time'),
    contactsShowUser: storage.ssGet('contacts_show_user'),
    chattingUser: storage.ssGet('chat_ing_user'),
    dbMessageData: {},
    ossClient: storage.ssGet('ossClient')
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
    setClearData({ commit }) {
      commit('clearData')
    },
  }
  // modules: {
  // }
})
