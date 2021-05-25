<template>
  <div :class="'view-wrapper ' + (loginSessionId && +this.myWinId === 1 ? 'is-login' : '')">
    <div class="header-btn-line" v-if="sysForWin">
      <WinBtnLine />
    </div>
    <div class="page-slide drag" v-if="loginSessionId && +this.myWinId === 1">
      <SlideBar :data="myInfo" @logout="logout" />
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
import websocket from 'utils/websocket'
import { remote } from 'electron'
import Win from 'utils/winOptions'
import db from '@/db'

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
      myInfo: {}
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
    }
  }
}
</script>
