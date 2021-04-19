import { createStore } from 'vuex'
import * as storage from 'utils/storage'

export default createStore({
  state: {
    loginData: storage.lcGet('login_data'),
    notifyData: {},
    contactsTime: storage.lcGet('contacts_time')
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
      storage.ssSet('contacts_time', timestr)
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
  }
  // modules: {
  // }
})
