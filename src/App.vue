<template>
  <div :class="'view-wrapper ' + (loginSessionId && +this.myWinId === 1 ? 'is-login' : '')">
    <div class="header-btn-line" v-if="sysForWin">
      <WinBtnLine />
    </div>
    <div class="page-slide drag" v-if="loginSessionId && +this.myWinId === 1">
      <SlideBar :data="myInfo" @logout="logout" :friendNum="friendNum" />
    </div>
    <router-view/>
    <Notify />
  </div>
</template>

<style lang="scss">
#app,
.view-wrapper {
  width: 100%;
  height: 100%;
}

.view-wrapper {
  position: relative;

  .header-btn-line {
    display: none;
  }

  &.is-login {
    padding-left: 80px;

    .header-btn-line {
      display: block;
    }
  }

  .page-slide {
    width: 80px;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background-color: $color-primary;
  }
}
</style>
<script>
import { WinBtnLine, SlideBar, Notify } from 'components'
import packageJson from '../package.json'
import os from 'os'
import api from 'utils/api'
import websocket from 'utils/websocket'
import { remote } from 'electron'
import Win from 'utils/winOptions'
import db from '@/db'
import { deepClone, intervalTime } from 'utils/common'

const creatWinFun = () => {
  Object.keys(Win).forEach(fun => {
    Win[fun]({})
  })
}

export default {
  data() {
    return {
      sysForWin: os.type() === 'Windows_NT' ? true : false,//系统判断
      myWinId: 0,
      myInfo: {},
      pageQuery: {
        pageNum: 1,
        pageSize: 10000
      }
    }
  },
  components: {
    WinBtnLine,
    SlideBar,
    Notify
  },
  async created() {
    if (packageJson.istoout) {
      // 对外版本禁止强制刷新
      window.onkeydown = (e) => {
        const ev = window.event || e
        const code = ev.keyCode || ev.which
        if (code === 82 && (ev.metaKey || ev.ctrlKey)) {
          return false
        }
      }
    }
  },
  mounted() {
    creatWinFun()
  },
  methods: {
    logout() {
      websocket.close()
    },
    clickEvent(e) {
      console.log(e)
    },
    initContactList() {
      const getListTimeStr = this.$store.state.contactsTime
      const param = Object.assign({
        time: getListTimeStr || new Date().getTime()
      }, this.pageQuery)
      api.contactList({
        param
      }).then(async (res) => {
        if (res.contactList) {
          res.contactList.map(o => o.uid = o.userInfo.uid)
          this.$store.dispatch('setContactsTime', res.lastUpdateTime)
          await this.$contactsDB.saveContacts(res.contactList)
        }
      })
    },
    initApplyList() {
      api.contactApplyList().then(async res => {
        const unRecordList = deepClone(res.unRecordList || [])
        const recordList = deepClone(res.recordList || [])
        unRecordList.map(o => {
          o.status = intervalTime(o.modifyTime) >= 7 ? 3 : 1 // 等待验证
          o.uid = o.userInfo.uid
        })
        recordList.map(o => {
          o.status = 2 // 已操作
          o.uid = o.userInfo.uid
        })
        const all = [...unRecordList, ...recordList]
        all.sort((a, b) => {
          return b.modifyTime - a.modifyTime
        })
        await this.$newUsersDB.saveNewUsers(all)
      })
    },
    onLoginChange(id) {
      const loginData = this.$store.state.loginData || {}
      const uid = loginData.userInfo && loginData.userInfo.uid
      this.myWinId = remote.getCurrentWindow().id

      if (this.myWinId === 1) {
        if (!id) {
          this.$router.push({ path: '/login' })
          return false
        }
        db.userDB.creatDB(uid)
        db.msgDB.creatUserDB(uid)
        db.msgDB.creatGroupDB(uid)
        setTimeout(() => {
          websocket.init()
          this.initContactList()
          this.initApplyList()
        }, 500)
      }
    }
  },
  watch: {
    loginSessionId: {
      handler: 'onLoginChange',
      immediate: true,
      deep: true
    }
  },
  computed: {
    loginSessionId() {
      const loginData = this.$store.state.loginData
      this.myInfo = (loginData && loginData.userInfo) || {}
      return loginData && loginData.sessionId
    },
    friendNum() {
      return +this.$store.state.newFriendNum
    }
  }
}
</script>
