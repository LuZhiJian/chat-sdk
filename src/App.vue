<template>
  <div class="header-btn-line" >
    <WinBtnLine />
  </div>
  <router-view/>
</template>

<style lang="scss">
#app {
  width: 100%;
  height: 100%;
  @include linear-gradient(to bottom, #13303e, #267c7d);
}
</style>
<script>
import { WinBtnLine } from 'components'
import packageJson from '../package.json'
import os from 'os'

export default {
  data() {
    return {
      sysForWin: os.type() === 'Windows_NT' ? true : false,//系统判断
    }
  },
  components: {
    WinBtnLine
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
  },
  methods: {
    clickEvent(e) {
      console.log(e)
    }
  },
  watch: {
    // isLogin: {
    //   handler: 'onLoginChange',
    //   immediate: true,
    //   deep: true
    // },
  },
  computed: {
  }
}
</script>
